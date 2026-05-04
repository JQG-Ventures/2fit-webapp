import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import type { Session } from 'next-auth';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/register', '/re-auth', '/options/forgotpassword'];
const LOCALE_PREFIX_RE = /^\/(en|es)(?=\/|$)/;

function logMiddleware(event: string, payload: Record<string, unknown>): void {
    console.warn(`[AUTH_DEBUG][middleware] ${event}`, payload);
}

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
    const normalizedPath = normalizePath(pathname);
    const isAuthenticated = Boolean(req.auth?.user);
    const isPublic = isPublicPath(pathname);
    const cookieHeader = req.headers.get('cookie') ?? '';
    const authCookieNames = cookieHeader
        .split(';')
        .map((entry) => entry.trim().split('=')[0] ?? '')
        .filter((name) => name.includes('authjs') || name.includes('next-auth'));

    let decision: 'next' | 'redirect:/' | 'redirect:/home' = 'next';

    if (!isAuthenticated && !isPublic) {
        decision = 'redirect:/';
        logMiddleware('route-decision', {
            method: req.method,
            pathname,
            normalizedPath,
            isPublic,
            isAuthenticated,
            hasAuthObject: Boolean(req.auth),
            authUser: req.auth?.user ?? null,
            cookieLength: cookieHeader.length,
            authCookieNames,
            decision,
            referer: req.headers.get('referer'),
            userAgent: req.headers.get('user-agent'),
        });
        return NextResponse.redirect(new URL('/', req.url));
    }

    if (isAuthenticated && isPublic) {
        decision = 'redirect:/home';
        logMiddleware('route-decision', {
            method: req.method,
            pathname,
            normalizedPath,
            isPublic,
            isAuthenticated,
            hasAuthObject: Boolean(req.auth),
            authUser: req.auth?.user ?? null,
            cookieLength: cookieHeader.length,
            authCookieNames,
            decision,
            referer: req.headers.get('referer'),
            userAgent: req.headers.get('user-agent'),
        });
        return NextResponse.redirect(new URL('/home', req.url));
    }

    logMiddleware('route-decision', {
        method: req.method,
        pathname,
        normalizedPath,
        isPublic,
        isAuthenticated,
        hasAuthObject: Boolean(req.auth),
        authUser: req.auth?.user ?? null,
        cookieLength: cookieHeader.length,
        authCookieNames,
        decision,
        referer: req.headers.get('referer'),
        userAgent: req.headers.get('user-agent'),
    });

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!_next|api|static|favicon.ico|images).*)'],
};
