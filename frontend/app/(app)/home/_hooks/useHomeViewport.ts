'use client';

import { useEffect, useState } from 'react';
import { HOME_DESKTOP_MIN_WIDTH_PX } from '@/app/(app)/home/constants';

export function useHomeViewport() {
    const [mounted, setMounted] = useState(false);
    const [isDesktopOrLaptop, setIsDesktopOrLaptop] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleResize = () =>
            setIsDesktopOrLaptop(window.innerWidth >= HOME_DESKTOP_MIN_WIDTH_PX);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return { mounted, isDesktopOrLaptop };
}
