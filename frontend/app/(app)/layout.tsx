'use client';

import NavBar from '@/app/_components/navbar/NavBar';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
import LoadingScreen from '@/app/_components/animations/LoadingScreen';
import ErrorBoundaryWrapper from '@/app/_components/others/ErrorBoundaryWrapper';

const AppLayout = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <NavBar />
            <ErrorBoundaryWrapper>
                <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
            </ErrorBoundaryWrapper>
        </>
    );
};

export default AppLayout;
