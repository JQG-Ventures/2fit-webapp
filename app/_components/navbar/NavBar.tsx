'use client';

import React from 'react';
import DesktopNavBar from './DesktopNavBar';
import MobileNavBar from './MobileNavBar';  // Existing mobile navbar for small screens
import { usePathname } from 'next/navigation';
import { FaHome, FaDumbbell, FaRobot, FaUser } from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';

const navItems = [
    { href: '/home', label: 'Home', icon: <FaHome /> },
    { href: '/workouts', label: 'Workouts', icon: <FaDumbbell /> },
    { href: '/bot', label: 'Bot', icon: <FaRobot /> },
    { href: '/profile', label: 'Profile', icon: <FaUser /> },
];

const NavBar: React.FC = () => {
    const pathname = usePathname();
    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' });
    const showNavBarPaths = ['/home', '/workouts', '/bot', '/profile'];
    const shouldShowNavBar = showNavBarPaths.some(path => pathname.startsWith(path));

    if (!shouldShowNavBar) {
        return null;
    }

    const currentPage = navItems.find(item => pathname.startsWith(item.href))?.label?.toLowerCase() || 'home';
    return isDesktopOrLaptop ? (
        <DesktopNavBar navItems={navItems} currentPage={currentPage} /> 
    ) : (
        <MobileNavBar navItems={navItems} currentPage={currentPage} />
    );
};

export default NavBar;
