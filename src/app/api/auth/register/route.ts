import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import EducatorProfile from '@/models/EducatorProfile';
import { hashPassword, createSession } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['student', 'educator']),
    // Educator specific fields
    experienceYears: z.number().optional(),
    institution: z.string().optional(),
    qualification: z.string().optional(),
    bio: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        const result = registerSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { name, email, password, role, experienceYears, institution, qualification, bio } = result.data;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        const passwordHash = await hashPassword(password);

        const user = await User.create({
            name,
            email,
            passwordHash,
            role,
        });

        if (role === 'educator') {
            if (!experienceYears || !institution || !qualification) {
                // Rollback user creation if educator profile data is missing (simple approach)
                await User.findByIdAndDelete(user._id);
                return NextResponse.json(
                    { error: 'Missing educator profile fields' },
                    { status: 400 }
                );
            }

            await EducatorProfile.create({
                userId: user._id,
                experienceYears,
                institution,
                qualification,
                bio,
            });
        }

        // Auto login after register
        await createSession({ userId: user._id.toString(), role: user.role, name: user.name });

        return NextResponse.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
