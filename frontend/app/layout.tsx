'use client';

import './globals.css';
import './_css/base.css';
import { Inter, Urbanist } from 'next/font/google';
import { RegisterProvider } from './_components/register/RegisterProvider';
import AuthProvider from './_providers/AuthProvider';
import NavBar from './_components/navbar/NavBar';
import { LanguageProvider } from './utils/LanguageContext';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
import '@/app/utils/i18n';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingScreen from './_components/animations/LoadingScreen';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import ErrorBoundaryWrapper from './_components/others/ErrorBoundaryWrapper';

const inter = Inter({ subsets: ['latin'] });
const urbanist = Urbanist({ subsets: ['latin'], weight: ['400', '600'] });

const LayoutContent = ({ children }: { children: ReactNode }) => {
    const pathname = usePathname();
    const { status } = useSession();

    const hideNavBarPaths = ['/login', '/re-auth', '/register', '/login/google'];
    const shouldShowNavBar =
        pathname !== '/' && !hideNavBarPaths.includes(pathname) && status === 'authenticated';

    return (
        <>
            {shouldShowNavBar && <NavBar />}
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                >
                    <ErrorBoundaryWrapper>
                        <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
                    </ErrorBoundaryWrapper>
                </motion.div>
            </AnimatePresence>
        </>
    );
};

const RootLayout = ({ children }: { children: ReactNode }) => {
    return (
        <html lang="en" className={`${inter.className} ${urbanist.className}`}>
            <body id="2fit-ai-body">
                <LanguageProvider>
                    <RegisterProvider>
                        <AuthProvider>
                            <LayoutContent>{children}</LayoutContent>
                        </AuthProvider>
                    </RegisterProvider>
                </LanguageProvider>
            </body>
        </html>
    );
};

export default RootLayout;
