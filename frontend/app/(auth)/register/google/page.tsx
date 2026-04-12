'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useRegister } from '@/app/_components/register/RegisterProvider';
import { isEmailAvailable } from '@/app/_services/userService';

export default function RegisterSocial() {
    const router = useRouter();
    const { data: session } = useSession();
    const { updateData } = useRegister();

    useEffect(() => {
        const doCheck = async () => {
            if (session?.user?.email) {
                const available = await isEmailAvailable(session.user.email);
                if (!available) {
                    router.push('/register?error=emailExistsGoogle');
                } else {
                    updateData({ email: session.user.email, auth_provider: 'google' });
                    router.push('/register');
                }
            } else {
                router.push('/register?error=googleError');
            }
        };
        void doCheck();
    }, [session, router, updateData]);

    return (
        <div className="flex items-center justify-center h-screen">
            <p>Processing your Google account...</p>
        </div>
    );
}
