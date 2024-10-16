import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;
    const publicRoutes = ['/login', '/register'];
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    if (!token && pathname === '/') {
        return NextResponse.next();
    }

    if (!token && isPublicRoute) {
        return NextResponse.next();
    }

    if (token && (pathname === '/' || isPublicRoute)) {
        return NextResponse.redirect(new URL('/home', req.url));
    }

    return NextResponse.next();	
}

export const config = {
    matcher: [
        '/((?!_next|api|static|favicon.ico).*)'
    ],
};
