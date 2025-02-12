'use client';

import React, { useState, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from '../searchbar/SearchBarComponent';

type NavItem = {
    href: string;
    label: string;
    icon: JSX.Element;
};

type DesktopNavBarProps = {
    navItems: NavItem[];
    selectedPath: string;
    onNavClick: (path: string) => void;
};

const DesktopNavBar: React.FC<DesktopNavBarProps> = ({ navItems, selectedPath, onNavClick }) => {
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useLayoutEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <nav className="fixed top-0 left-0 w-full bg-gray-800 text-white px-6 shadow-lg z-50">
            <div className="flex justify-between items-center w-full max-w-full">
                <div className="w-[20%] flex items-center justify-start"></div>
                <div className="w-[60%] flex items-center justify-center gap-12">
                    {navItems.map((item) => {
                        const isActive = selectedPath.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => onNavClick(item.href)}
                                className={`flex items-center gap-3 p-4 py-6 transition-colors duration-300 ease-in-out ${isActive ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                {React.cloneElement(item.icon, { className: 'h-7 w-7' })}
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
                <div className="w-[20%] flex items-center justify-end relative">
                    <div className="absolute right-0 h-8 w-54">
                        <SearchBar isDesktop={true} />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default DesktopNavBar;
