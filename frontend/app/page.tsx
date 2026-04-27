import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';
import { auth } from '@/auth';
import LandingPage from './(auth)/page';

export default async function Page() {
    const session = (await auth()) as Session | null;

    // If authenticated, always land on the app home.
    // This also guarantees `/` exists in production even if route-group routing behaves differently.
    if (session?.user?.token) {
        redirect('/home');
    }

    return <LandingPage />;
}
