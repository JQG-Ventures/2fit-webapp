import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: any) {
	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

	const { pathname } = req.nextUrl;

	const publicRoutes = ['/register', '/login', '/register/*', '/'];

	if (!token && !publicRoutes.some((route) => pathname.startsWith(route))) {
		return NextResponse.redirect(new URL('/login', req.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		'/((?!_next|api|static|favicon.ico).*)',
	],
};
