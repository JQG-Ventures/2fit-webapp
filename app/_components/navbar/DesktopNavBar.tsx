'use client';

import React, { useState, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import { FaSearch } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

type NavItem = {
    href: string;
    label: string;
    icon: JSX.Element;
};

type DesktopNavBarProps = {
    navItems: NavItem[];
};

const DesktopNavBar: React.FC<DesktopNavBarProps> = ({ navItems }) => {
    const pathname = usePathname();
    const [isSearchOpen, setSearchOpen] = useState<boolean>(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useLayoutEffect(() => {
        setIsMounted(true);
    }, []);

    // Prevent server-side rendering
    if (!isMounted) return null;

    return (
        <nav className="fixed top-0 left-0 w-full bg-gray-800 text-white px-6 shadow-lg z-50">
            <div className="flex justify-between items-center w-full max-w-full">
                <div className="w-[20%] flex items-center justify-start"></div>

                <div className="w-[60%] flex items-center justify-center gap-12">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 p-4 py-6 transition-colors duration-300 ease-in-out ${
                                    isActive ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                {React.cloneElement(item.icon, { className: 'h-7 w-7' })}
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="w-[20%] flex items-center justify-end" ref={searchRef}>
                    <div className={`relative flex items-center ${isSearchOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out`}>
                        <FaSearch
                            className={`h-6 w-6 text-4xl cursor-pointer text-gray-300 hover:text-white transition-transform duration-300 ease-in-out ${
                                isSearchOpen ? 'transform translate-x-8' : ''
                            }`}
                            onClick={() => setSearchOpen(!isSearchOpen)}
                        />
                        <input
                            type="text"
                            placeholder="Search..."
                            className={`absolute right-0 h-8 px-4 rounded-full bg-gray-700 text-white outline-none transition-all duration-300 ease-in-out ${
                                isSearchOpen ? 'opacity-100 w-64' : 'opacity-0 w-0'
                            }`}
                            style={{ zIndex: 100 }}
                            onBlur={() => setSearchOpen(false)}
                            onFocus={() => setSearchOpen(true)}
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default DesktopNavBar;
