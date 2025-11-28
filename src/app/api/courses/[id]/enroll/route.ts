import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import { verifySession } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const existing = await Enrollment.findOne({
        studentId: session.userId,
        courseId: id,
    });

    if (existing) {
        return NextResponse.json({ message: 'Already enrolled' });
    }

    const enrollment = await Enrollment.create({
        studentId: session.userId,
        courseId: id,
    });

    return NextResponse.json(enrollment);
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ enrolled: false });
    }

    await dbConnect();
    const enrollment = await Enrollment.findOne({
        studentId: session.userId,
        courseId: id,
    });

    if (enrollment) {
        return NextResponse.json({ enrolled: true, enrollment });
    } else {
        return NextResponse.json({ enrolled: false });
    }
}
