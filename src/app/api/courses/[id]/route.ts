import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import { verifySession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await dbConnect();
    try {
        const course = await Course.findById(id).populate('educatorId', 'name');
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }
        return NextResponse.json(course);
    } catch (error) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await verifySession();
    if (!session || session.role !== 'educator') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const course = await Course.findById(id);
    if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (course.educatorId.toString() !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updatedCourse = await Course.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updatedCourse);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await verifySession();
    if (!session || session.role !== 'educator') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const course = await Course.findById(id);
    if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (course.educatorId.toString() !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Course.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
}
