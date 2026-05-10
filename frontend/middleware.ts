import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import type { Session } from 'next-auth';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/register', '/re-auth', '/options/forgotpassword'];
const LOCALE_PREFIX_RE = /^\/(en|es)(?=\/|$)/;

function normalizePath(pathname: string): string {
    const withoutLocale = pathname.replace(LOCALE_PREFIX_RE, '') || '/';
    if (withoutLocale !== '/' && withoutLocale.endsWith('/')) {
        return withoutLocale.slice(0, -1);
    }
    return withoutLocale;
}

function isPublicPath(pathname: string): boolean {
    const normalizedPath = normalizePath(pathname);
    return PUBLIC_PATHS.some((publicPath) =>
        publicPath === '/'
            ? normalizedPath === '/'
            : normalizedPath === publicPath || normalizedPath.startsWith(`${publicPath}/`),
    );
}

export default auth((req: NextRequest & { auth: Session | null }) => {
    const { pathname } = req.nextUrl;
    const isAuthenticated = Boolean(req.auth?.user);
    const isPublic = isPublicPath(pathname);

    if (!isAuthenticated && !isPublic) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    if (isAuthenticated && isPublic) {
        return NextResponse.redirect(new URL('/home', req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!_next|api|static|favicon.ico|images).*)'],
};
