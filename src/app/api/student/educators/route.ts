import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import User from '@/models/User';
import ChatMessage from '@/models/ChatMessage';
import { verifySession } from '@/lib/auth';

export async function GET() {
    const session = await verifySession();
    if (!session || session.role !== 'student') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // 1. Get all enrollments for this student
    const enrollments = await Enrollment.find({ studentId: session.userId });
    const courseIds = enrollments.map(e => e.courseId);

    // 2. Get courses to find educators
    const courses = await Course.find({ _id: { $in: courseIds } }).populate('educatorId', 'name email _id');

    // 3. Extract unique educators
    const educatorsMap = new Map();
    courses.forEach((course: any) => {
        if (course.educatorId) {
            educatorsMap.set(course.educatorId._id.toString(), course.educatorId);
        }
    });

    const educators = Array.from(educatorsMap.values());

    // 4. Add unread message count for each educator
    const educatorsWithStats = await Promise.all(educators.map(async (educator: any) => {
        const unreadCount = await ChatMessage.countDocuments({
            senderId: educator._id,
            receiverId: session.userId,
            isRead: false
        });

        return {
            _id: educator._id,
            name: educator.name,
            email: educator.email,
            unreadCount
        };
    }));

    return NextResponse.json(educatorsWithStats);
}
