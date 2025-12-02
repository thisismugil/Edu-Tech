import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { sendOTP } from '@/lib/email';
import { z } from 'zod';

const sendOtpSchema = z.object({
    email: z.string().email(),
    type: z.enum(['signup', 'reset']),
});

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        const result = sendOtpSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { email, type } = result.data;

        // Check user existence based on type
        const existingUser = await User.findOne({ email });
        if (type === 'signup' && existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }
        if (type === 'reset' && !existingUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP (upsert to replace existing if any)
        await OTP.findOneAndUpdate(
            { email },
            { email, otp, createdAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Send Email
        const sent = await sendOTP(email, otp);
        if (!sent) {
            return NextResponse.json(
                { error: 'Failed to send email' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'OTP sent successfully' });
    } catch (error: any) {
        console.error('Send OTP error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
