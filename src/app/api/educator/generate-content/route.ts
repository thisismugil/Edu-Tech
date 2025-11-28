import { NextResponse } from 'next/server';
import { generateLessonContent } from '@/lib/ai';
import { verifySession } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session || session.role !== 'educator') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { courseTopic, moduleTitle, lessonTitle, tone } = await request.json();
        const content = await generateLessonContent(courseTopic, moduleTitle, lessonTitle, tone);
        return NextResponse.json(content);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
    }
}
