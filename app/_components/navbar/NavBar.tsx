'use client';

import React, { useEffect, useState } from 'react';
import DesktopNavBar from './DesktopNavBar';
import MobileNavBar from './MobileNavBar';
import { usePathname } from 'next/navigation';
import { FaHome, FaDumbbell, FaRobot, FaUser } from 'react-icons/fa';

const navItems = [
    { href: '/home', label: 'Home', icon: <FaHome /> },
    { href: '/workouts', label: 'Workouts', icon: <FaDumbbell /> },
    { href: '/bot', label: 'Bot', icon: <FaRobot /> },
    { href: '/profile', label: 'Profile', icon: <FaUser /> },
];

const NavBar: React.FC = () => {
    const pathname = usePathname();
    const [isDesktopOrLaptop, setIsDesktopOrLaptop] = useState(false);

    useEffect(() => {
        const updateMedia = () => {
            setIsDesktopOrLaptop(window.innerWidth >= 1224);
        };

        updateMedia();
        window.addEventListener('resize', updateMedia);
        
        return () => window.removeEventListener('resize', updateMedia);
    }, []);

    const currentPage = navItems.find(item => pathname.startsWith(item.href))?.label?.toLowerCase() || 'home';
    const showNavBarPaths = ['/home', '/workouts', '/bot', '/profile'];
    const shouldShowNavBar = showNavBarPaths.some(path => pathname.startsWith(path));

    if (!shouldShowNavBar) {
        return null;
    }

    return isDesktopOrLaptop ? (
        <DesktopNavBar navItems={navItems} currentPage={currentPage} />
    ) : (
        <MobileNavBar navItems={navItems} currentPage={currentPage} />
    );
};

export default NavBar;
