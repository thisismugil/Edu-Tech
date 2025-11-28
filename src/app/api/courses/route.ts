import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import { verifySession } from '@/lib/auth';
import { z } from 'zod';

const createCourseSchema = z.object({
    title: z.string().min(3),
    topic: z.string(),
    description: z.string(),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    tone: z.string(),
    totalDuration: z.string(),
    modules: z.array(z.any()).optional(), // Validate structure more strictly if needed
    isPublished: z.boolean().optional(),
});

export async function GET(request: Request) {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const level = searchParams.get('level');
    const search = searchParams.get('search');
    const educatorId = searchParams.get('educatorId');

    const query: any = { isPublished: true };

    if (topic) query.topic = topic;
    if (level) query.level = level;
    if (educatorId) {
        query.educatorId = educatorId;
        delete query.isPublished; // Educators can see their own unpublished courses if they filter by their ID
    }
    if (search) {
        query.$text = { $search: search };
    }

    const courses = await Course.find(query).populate('educatorId', 'name').sort({ createdAt: -1 });
    return NextResponse.json(courses);
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session || session.role !== 'educator') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const body = await request.json();
        const result = createCourseSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Validation failed', details: result.error.flatten() }, { status: 400 });
        }

        const course = await Course.create({
            ...result.data,
            educatorId: session.userId,
        });

        return NextResponse.json(course);
    } catch (error) {
        console.error('Create Course Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
