'use client';

import { NextUIProvider } from '@nextui-org/react';
import { SessionProvider } from 'next-auth/react';
import ReactQueryProvider from './ReactQueryProvider';

interface ProvidersProps {
    children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    return (
        <SessionProvider>
            <ReactQueryProvider>
                <NextUIProvider>{children}</NextUIProvider>
            </ReactQueryProvider>
        </SessionProvider>
    );
}
