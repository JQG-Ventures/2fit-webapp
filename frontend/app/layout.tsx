import './globals.css';
import './_css/base.css';
import { Inter, Urbanist } from 'next/font/google';
import AuthProvider from './_providers/AuthProvider';
import { LanguageProvider } from './utils/LanguageContext';
import I18nProvider from './_providers/I18nProvider';
import { auth } from '@/auth';
import type { Session } from 'next-auth';
import type { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });
const urbanist = Urbanist({ subsets: ['latin'], weight: ['400', '600'] });

const RootLayout = async ({ children }: { children: ReactNode }) => {
    const session = await auth();

    return (
        <html lang="en" className={`${inter.className} ${urbanist.className}`}>
            <body id="2fit-ai-body">
                <I18nProvider>
                    <LanguageProvider>
                        <AuthProvider session={session as Session | null}>{children}</AuthProvider>
                    </LanguageProvider>
                </I18nProvider>
            </body>
        </html>
    );
};

export default RootLayout;
