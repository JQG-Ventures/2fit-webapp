'use client';

import React, { useEffect, useState } from 'react';
import DesktopNavBar from './DesktopNavBar';
import MobileNavBar from './MobileNavBar'; 
import { usePathname } from 'next/navigation';
import { FaHome, FaDumbbell, FaRobot, FaUser } from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from 'react-i18next';


const NavBar: React.FC = () => {
    const { t } = useTranslation('global');
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);
    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' });
    const showNavBarPaths = ['/home', '/workouts', '/bot', '/profile'];
    const shouldShowNavBar = showNavBarPaths.some(path => pathname.startsWith(path));

    const navItems = [
        { href: '/home', label: t('Navbar.home'), icon: <FaHome /> },
        { href: '/workouts', label: t('Navbar.workouts'), icon: <FaDumbbell /> },
        { href: '/chat', label: t('Navbar.bot'), icon: <FaRobot /> },
        { href: '/profile', label: t('Navbar.profile'), icon: <FaUser /> },
    ];

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!shouldShowNavBar || !isClient) {
        return null;
    }

    return (
        <div>
            {isDesktopOrLaptop 
                ? <DesktopNavBar navItems={navItems} /> 
                : <MobileNavBar navItems={navItems} />}
        </div>
    );
};

export default NavBar;