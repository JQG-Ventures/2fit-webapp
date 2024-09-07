'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaSearch } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

type DesktopNavBarProps = {
    navItems: Array<{ href: string; label: string; icon: JSX.Element }>;
};

const DesktopNavBar: React.FC<DesktopNavBarProps> = ({ navItems }) => {
    const pathname = usePathname();
    const [isSearchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Handle clicks outside of the search component
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="fixed top-0 left-0 w-full bg-gray-800 text-white px-6 shadow-lg z-50">
            <div className="flex justify-between items-center w-full max-w-full">
                
                {/* First Section (20% width) */}
                <div className="w-[20%] flex items-center justify-start relative">
                    {/* Logo or other content can go here */}
                </div>

                {/* Middle Section (60% width) */}
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
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Third Section (20% width) */}
                <div className="w-[20%] flex items-center justify-end relative">
                    <div
                        ref={searchRef}
                        className={`relative flex items-center ${isSearchOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out`}
                    >
                        <FaSearch
                            className={`absolute h-6 w-6 text-4xl cursor-pointer text-gray-300 hover:text-white transition-transform duration-300 ease-in-out ${isSearchOpen ? 'transform translate-x-8' : ''}`}
                            onClick={() => setSearchOpen(!isSearchOpen)}
                        />
                        <input
                            type="text"
                            placeholder="Search..."
                            className={`absolute right-0 h-8 px-4 rounded-full bg-gray-700 text-white outline-none transition-all duration-300 ease-in-out ${isSearchOpen ? 'opacity-100 w-64' : 'opacity-0 w-0'}`}
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
