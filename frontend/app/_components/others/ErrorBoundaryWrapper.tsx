'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './ErrorFallback';

export default function ErrorBoundaryWrapper({ children }: { children: ReactNode }) {
    const router = useRouter();

    const handleReset = () => {
        router.refresh();
    };

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset}>
            {children}
        </ErrorBoundary>
    );
}
