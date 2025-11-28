import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ChatMessage from '@/models/ChatMessage';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import { verifySession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: courseId } = await params;
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Check if user is enrolled or is the educator
    const isEnrolled = await Enrollment.exists({ studentId: session.userId, courseId });
    const isEducator = await Course.exists({ _id: courseId, educatorId: session.userId });

    if (!isEnrolled && !isEducator && session.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await ChatMessage.find({ courseId })
        .populate('senderId', 'name role')
        .sort({ createdAt: 1 });

    return NextResponse.json(messages);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: courseId } = await params;
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { message } = await request.json();

    // Check permissions
    const isEnrolled = await Enrollment.exists({ studentId: session.userId, courseId });
    const isEducator = await Course.exists({ _id: courseId, educatorId: session.userId });

    if (!isEnrolled && !isEducator) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const chatMessage = await ChatMessage.create({
        courseId,
        senderId: session.userId,
        message,
    });

    const populated = await chatMessage.populate('senderId', 'name role');

    return NextResponse.json(populated);
}
