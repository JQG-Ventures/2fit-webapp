'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterStep2() {
    const router = useRouter();

    useEffect(() => {
        router.push('/register/step3');
    }, [router]);

    return null;
}
