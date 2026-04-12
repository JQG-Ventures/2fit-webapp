'use client';

import { RegisterProvider } from '@/app/_components/register/RegisterProvider';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
import LoadingScreen from '@/app/_components/animations/LoadingScreen';
import ErrorBoundaryWrapper from '@/app/_components/others/ErrorBoundaryWrapper';

const AuthLayout = ({ children }: { children: ReactNode }) => {
    return (
        <RegisterProvider>
            <ErrorBoundaryWrapper>
                <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
            </ErrorBoundaryWrapper>
        </RegisterProvider>
    );
};

export default AuthLayout;
