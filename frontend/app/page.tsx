import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';
import { auth } from '@/auth';
import AuthLandingPage from '@/app/_components/landing/AuthLandingPage';

export default async function Page() {
    const session = (await auth()) as Session | null;

    if (session?.user?.token) {
        redirect('/home');
    }

    return <AuthLandingPage />;
}