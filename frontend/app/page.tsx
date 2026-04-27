import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import LandingPage from './(auth)/page';

export default async function Page() {
    const session = await auth();

    // If authenticated, always land on the app home.
    // This also guarantees `/` exists in production even if route-group routing behaves differently.
    if (session?.user?.token) {
        redirect('/home');
    }

    return <LandingPage />;
}
