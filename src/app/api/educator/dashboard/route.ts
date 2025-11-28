import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import User from '@/models/User';
import { verifySession } from '@/lib/auth';

export async function GET() {
    const session = await verifySession();
    if (!session || session.role !== 'educator') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Ensure User model is registered in the current mongoose instance
    // This fixes the "MissingSchemaError: Schema hasn't been registered for model 'User'" error
    // which happens when Enrollment model tries to populate 'studentId' (ref: 'User')
    // but User model hasn't been registered in the current mongoose instance yet.
    if (!mongoose.models.User && User) {
        mongoose.model('User', User.schema);
    }

    // 1. Get all courses by this educator
    const courses = await Course.find({ educatorId: session.userId }).lean();

    // 2. For each course, get enrollments with student details
    const coursesWithStats = await Promise.all(courses.map(async (course: any) => {
        const enrollments = await Enrollment.find({ courseId: course._id }).populate('studentId', 'name email');

        const students = enrollments.map((e: any) => ({
            name: e.studentId?.name || 'Unknown',
            email: e.studentId?.email
        }));

        return {
            ...course,
            studentCount: students.length,
            students: students
        };
    }));

    // 3. Calculate total unique students
    const allStudentIds = new Set();
    for (const course of coursesWithStats) {
        const enrollments = await Enrollment.find({ courseId: course._id });
        enrollments.forEach((e: any) => allStudentIds.add(e.studentId.toString()));
    }

    return NextResponse.json({
        courses: coursesWithStats,
        totalCourses: courses.length,
        totalStudents: allStudentIds.size
    });
}
