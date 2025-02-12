"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useRegister } from '@/app/_components/register/RegisterProvider';
import { fetchUserDataByEmail } from '@/app/_services/userService';

export default function RegisterSocial() {
    const router = useRouter();
    const { data: session } = useSession();
    const { updateData } = useRegister();

    useEffect(() => {
        const doCheck = async () => {
            if (session?.user?.email) {
                const emailExists = await fetchUserDataByEmail(session.user.email);
                if (emailExists) {
                    router.push('/register?error=emailExistsGoogle');
                } else {
                    // @ts-ignore
                    updateData({
                        email: session.user.email!,
                        auth_provider: 'google'
                    });
                    router.push('/register/step1');
                }
            } else {
                router.push('/register?error=googleError');
            }
        };
        doCheck();
    }, [session, router, updateData]);

    return (
        <div className="flex items-center justify-center h-screen">
            <p>Processing your Google account...</p>
        </div>
    );
}
