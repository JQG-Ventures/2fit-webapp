import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server'; 


export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    const publicRoutes = ['/login', '/register'];
    const isRootRoute = pathname === '/';
    const isPublicRoute = isRootRoute || publicRoutes.some((route) => pathname.startsWith(route));
    const isNotAuthenticated = Boolean(!token?.accessToken);

    if (isNotAuthenticated) {
        if (isPublicRoute) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/', req.url));
    }

    if (!isNotAuthenticated && isPublicRoute) {
        return NextResponse.redirect(new URL('/home', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next|api|static|favicon.ico).*)',
    ],
};
