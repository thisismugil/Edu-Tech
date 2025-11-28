import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import ChatMessage from '@/models/ChatMessage';
import { verifySession } from '@/lib/auth';

export async function GET() {
    const session = await verifySession();
    if (!session || session.role !== 'educator') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // 1. Get all courses by this educator
    const courses = await Course.find({ educatorId: session.userId }).select('_id');
    const courseIds = courses.map(c => c._id);

    // 2. Get all enrollments for these courses to find students
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } }).populate('studentId', 'name email');

    // 3. Extract unique students
    const uniqueStudents = new Map();
    enrollments.forEach((e: any) => {
        if (e.studentId && !uniqueStudents.has(e.studentId._id.toString())) {
            uniqueStudents.set(e.studentId._id.toString(), {
                _id: e.studentId._id,
                name: e.studentId.name,
                email: e.studentId.email,
                unreadCount: 0,
                lastMessage: null
            });
        }
    });

    // 4. Get chat stats for each student (unread count, last message)
    const students = Array.from(uniqueStudents.values());

    await Promise.all(students.map(async (student: any) => {
        const unreadCount = await ChatMessage.countDocuments({
            senderId: student._id,
            receiverId: session.userId,
            isRead: false
        });

        const lastMessage = await ChatMessage.findOne({
            $or: [
                { senderId: student._id, receiverId: session.userId },
                { senderId: session.userId, receiverId: student._id }
            ]
        }).sort({ createdAt: -1 });

        student.unreadCount = unreadCount;
        student.lastMessage = lastMessage ? lastMessage.createdAt : null;
    }));

    // Sort by last message (most recent first)
    students.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage).getTime() - new Date(a.lastMessage).getTime();
    });

    return NextResponse.json(students);
}
