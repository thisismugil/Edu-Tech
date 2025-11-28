import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || 'supersecretkey_change_this_in_production'
);

export interface SessionPayload extends JWTPayload {
    userId: string;
    role: string;
    name?: string;
}

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(SECRET_KEY);

    (await cookies()).set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
    });
}

export async function verifySession(): Promise<SessionPayload | null> {
    const cookie = (await cookies()).get('session')?.value;
    if (!cookie) return null;

    try {
        const { payload } = await jwtVerify(cookie, SECRET_KEY);
        return payload as SessionPayload;
    } catch (e) {
        return null;
    }
}

export async function deleteSession() {
    (await cookies()).delete('session');
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookie = (await cookies()).get('session')?.value;
    if (!cookie) return null;
    try {
        const { payload } = await jwtVerify(cookie, SECRET_KEY);
        return payload as SessionPayload;
    } catch (error) {
        return null;
    }
}
