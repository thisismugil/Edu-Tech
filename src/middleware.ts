import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define protected routes
    const isEducatorRoute = path.startsWith('/educator');
    const isAdminRoute = path.startsWith('/admin');
    const isLearningRoute = path.startsWith('/learning');
    const isAuthRoute = path.startsWith('/auth');

    const session = await verifySession();

    // Redirect to login if accessing protected route without session
    if ((isEducatorRoute || isAdminRoute || isLearningRoute) && !session) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Redirect to dashboard if accessing auth routes while logged in
    if (isAuthRoute && session) {
        if (session.role === 'educator') {
            return NextResponse.redirect(new URL('/educator', request.url));
        } else if (session.role === 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
        } else {
            return NextResponse.redirect(new URL('/courses', request.url));
        }
    }

    // Role-based access control
    if (isEducatorRoute && session?.role !== 'educator' && session?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (isAdminRoute && session?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/educator/:path*', '/admin/:path*', '/learning/:path*', '/auth/:path*'],
};
