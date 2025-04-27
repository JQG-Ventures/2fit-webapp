'use client';

import React, { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ImSpinner8 } from 'react-icons/im';

const ReauthPage = () => {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            signOut({ callbackUrl: '/login', redirect: true });
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="h-[20%]">
                <h1 className="text-2xl text-center mb-4">Session Expired</h1>
                <p className="mb-8">Please wait, logging out...</p>
            </div>

            <div>
                <div className="h-[30%]">
                    <ImSpinner8 className="text-emerald-500 text-7xl animate-spin" />
                </div>
            </div>
        </div>
    );
};

export default ReauthPage;
