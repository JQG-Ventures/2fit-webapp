'use client';

import React, { useEffect, useState } from 'react';
import DesktopNavBar from './DesktopNavBar';
import MobileNavBar from './MobileNavBar'; 
import { usePathname } from 'next/navigation';
import { FaHome, FaDumbbell, FaRobot, FaUser } from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from 'react-i18next';
import { useLoading } from '@/app/_providers/LoadingProvider';


const NavBar: React.FC = () => {
    const { t } = useTranslation('global');
    const pathname = usePathname();
    const { navigateWithLoading } = useLoading();
    const [isClient, setIsClient] = useState(false);
    const [selectedPath, setSelectedPath] = useState(pathname);
    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' });
    let showNavBarPaths = [];

    if (isDesktopOrLaptop) {showNavBarPaths = ['/home', '/workouts', '/bot', '/profile', '/premium'];}
    else {showNavBarPaths = ['/home', '/workouts', '/bot', '/profile'];}
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

    useEffect(() => {
        setSelectedPath(pathname);
    }, [pathname]);

    const handleNavClick = (path: string) => {
        if (pathname === path) return;
        setSelectedPath(path);
        navigateWithLoading(path);
    };

    if (!isClient) return null;

    return (
        <div style={{ display: shouldShowNavBar ? 'block' : 'none' }} className='fixed z-[999]'>
            {isDesktopOrLaptop 
                ? <DesktopNavBar navItems={navItems} selectedPath={selectedPath} onNavClick={handleNavClick} /> 
                : <MobileNavBar navItems={navItems} selectedPath={selectedPath} onNavClick={handleNavClick} />}
        </div>
    );
};

export default NavBar;