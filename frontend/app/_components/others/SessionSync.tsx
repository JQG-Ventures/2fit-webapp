'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { tokenStore } from '@/app/utils/tokenStore';

/**
 * Keeps the in-memory tokenStore in sync with the NextAuth session.
 * Must be rendered inside <SessionProvider>. Has no UI output.
 *
 * Sets the token synchronously on every render (not just in useEffect) so that
 * requests fired immediately after mount already have a token available.
 */
export default function SessionSync() {
    const { data: session } = useSession();

    // Synchronous update on every render — ensures tokenStore is populated
    // before any useEffect or React Query hook fires its first request.
    tokenStore.set(session?.user?.token ?? null);

    useEffect(() => {
        tokenStore.set(session?.user?.token ?? null);
    }, [session]);

    return null;
}
