import React from 'react';
import Link from 'next/link';

type DesktopNavBarProps = {
    currentPage: string;
    navItems: Array<{ href: string; label: string; icon: JSX.Element }>;
};

const DesktopNavBar: React.FC<DesktopNavBarProps> = ({ navItems, currentPage }) => {
    return (
        <nav className="flex justify-between items-center py-6 px-12 bg-gray-800 text-white w-4/5 mx-auto h-20">
            <div className="flex items-center">
                {React.cloneElement(navItems[0].icon, { className: 'h-16 w-16 text-green-500' })} {/* Adjusted size */}
            </div>
            <div className="flex gap-12">
                {navItems.map((item) => (
                    <Link href={item.href} key={item.href} className={`text-xl flex items-center gap-4 ${currentPage === item.href ? 'font-bold text-green-500' : 'hover:text-gray-300'}`}>
                        {React.cloneElement(item.icon, { className: 'h-16 w-16' })} {/* Adjusted size */}
                        {item.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default DesktopNavBar;
