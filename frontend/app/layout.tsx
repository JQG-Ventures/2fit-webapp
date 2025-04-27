'use client';

import './globals.css';
import './_css/base.css';
import { Inter, Urbanist } from 'next/font/google';
import { RegisterProvider } from './_components/register/RegisterProvider';
import AuthProvider from './_providers/AuthProvider';
import NavBar from './_components/navbar/NavBar';
import { LanguageProvider } from './utils/LanguageContext';
import { ReactNode } from 'react';
import '@/app/utils/i18n';
import { AnimatePresence, motion } from 'framer-motion';
import { LoadingProvider, useLoading } from './_providers/LoadingProvider';
import LoadingScreen from './_components/animations/LoadingScreen';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

// Load fonts with next/font/google (optimized)
const inter = Inter({ subsets: ['latin'] });
const urbanist = Urbanist({ subsets: ['latin'], weight: ['400', '600'] });

const LayoutContent = ({ children }: { children: ReactNode }) => {
    const { isLoading } = useLoading();
    const pathname = usePathname();
    const { status } = useSession();

    const hideNavBarPaths = ['/login', '/re-auth', '/register', '/login/google'];
    const shouldShowNavBar =
        pathname !== '/' && !hideNavBarPaths.includes(pathname) && status === 'authenticated';

    return (
        <>
            {shouldShowNavBar && <NavBar />}
            {isLoading && <LoadingScreen />}
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </>
    );
};

const RootLayout = ({ children }: { children: ReactNode }) => {
    return (
        <html lang="en" className={`${inter.className} ${urbanist.className}`}>
            <body id="test">
                <LanguageProvider>
                    <RegisterProvider>
                        <AuthProvider>
                            <LoadingProvider>
                                <LayoutContent>{children}</LayoutContent>
                            </LoadingProvider>
                        </AuthProvider>
                    </RegisterProvider>
                </LanguageProvider>
            </body>
        </html>
    );
};

export default RootLayout;
