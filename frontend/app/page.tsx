import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';
import { auth } from '@/auth';
import AuthLandingPage from '@/app/_components/landing/AuthLandingPage';

export default async function Page() {
    const session = (await auth()) as Session | null;
    console.warn('[AUTH_DEBUG][root-page] session-check', {
        hasSession: Boolean(session),
        hasUser: Boolean(session?.user),
        hasUserToken: Boolean(session?.user?.token),
        sessionUser: session?.user ?? null,
        accessTokenExpires: session?.accessTokenExpires ?? null,
    });

    if (session?.user?.token) {
        console.warn('[AUTH_DEBUG][root-page] redirect-home', {
            reason: 'session.user.token-present',
        });
        redirect('/home');
    }

    console.warn('[AUTH_DEBUG][root-page] render-auth-landing', {
        reason: 'missing-session-token',
    });
    return <AuthLandingPage />;
}
