import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyPassword, createSession } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        const result = loginSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid input' },
                { status: 400 }
            );
        }

        const { email, password } = result.data;

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        await createSession({ userId: user._id.toString(), role: user.role, name: user.name });

        return NextResponse.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
