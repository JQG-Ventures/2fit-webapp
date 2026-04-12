'use client';

import { NextUIProvider } from '@nextui-org/react';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import ReactQueryProvider from '@/app/_providers/ReactQueryProvider';
import SessionSync from '@/app/_components/others/SessionSync';

interface ProvidersProps {
    children: React.ReactNode;
    session: Session | null;
}

export default function Providers({ children, session }: ProvidersProps) {
    return (
        <SessionProvider session={session} refetchOnWindowFocus={false}>
            <SessionSync />
            <ReactQueryProvider>
                <NextUIProvider>{children}</NextUIProvider>
            </ReactQueryProvider>
        </SessionProvider>
    );
}
