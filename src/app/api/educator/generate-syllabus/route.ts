import { NextResponse } from 'next/server';
import { generateSyllabus } from '@/lib/ai';
import { verifySession } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session || session.role !== 'educator') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { topic, level, duration, tone, goals } = await request.json();
        const syllabus = await generateSyllabus(topic, level, duration, tone, goals);
        return NextResponse.json(syllabus);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate syllabus' }, { status: 500 });
    }
}
