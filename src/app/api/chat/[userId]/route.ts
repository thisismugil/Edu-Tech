import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ChatMessage from '@/models/ChatMessage';
import { verifySession } from '@/lib/auth';

// GET /api/chat/[userId] - Get messages between current user and [userId]
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId: otherUserId } = await params;
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const messages = await ChatMessage.find({
        $or: [
            { senderId: session.userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: session.userId }
        ]
    })
        .sort({ createdAt: 1 })
        .populate('senderId', 'name role')
        .populate('receiverId', 'name role');

    // Mark messages from other user as read
    await ChatMessage.updateMany(
        { senderId: otherUserId, receiverId: session.userId, isRead: false },
        { $set: { isRead: true } }
    );

    return NextResponse.json(messages);
}

// POST /api/chat/[userId] - Send message to [userId]
export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId: otherUserId } = await params;
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { message } = await request.json();
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    await dbConnect();

    const newMessage = await ChatMessage.create({
        senderId: session.userId,
        receiverId: otherUserId,
        message
    });

    const populatedMessage = await ChatMessage.findById(newMessage._id)
        .populate('senderId', 'name role')
        .populate('receiverId', 'name role');

    return NextResponse.json(populatedMessage);
}
