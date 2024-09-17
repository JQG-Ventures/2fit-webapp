'use client';

import React, { useEffect, useState } from 'react';
import DesktopNavBar from './DesktopNavBar';
import MobileNavBar from './MobileNavBar'; 
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
    const [isClient, setIsClient] = useState(false);
    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' });
    const showNavBarPaths = ['/home', '/workouts', '/bot', '/profile'];
    const shouldShowNavBar = showNavBarPaths.some(path => pathname.startsWith(path));

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