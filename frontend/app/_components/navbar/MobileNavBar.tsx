'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './NavBar.module.css';

type NavItem = {
    href: string;
    label: string;
    icon: JSX.Element;
};

type MobileNavBarProps = {
    navItems: NavItem[];
    selectedPath: string;
    onNavClick: (path: string) => void;
};

const MobileNavBar: React.FC<MobileNavBarProps> = ({ navItems, selectedPath, onNavClick }) => {
    const pathname = usePathname();
    const hideMobileNavBarPaths = [
        '/workouts/plan',
        '/workouts/countdown',
        '/profile/edit',
        '/profile/notification',
        '/profile/security',
        '/profile/premium',
    ];
    const [previousPath, setPreviousPath] = useState<string>(pathname);

    const getAnimationClasses = (isActive: boolean, itemIndex: number) => {
        const currentIndex = navItems.findIndex((item) => selectedPath.startsWith(item.href));
        const prevIndex = navItems.findIndex((item) => previousPath.startsWith(item.href));
        let backgroundAnimation = '';
        let textOutAnimation = '';
        let textInAnimation = '';
        if (isActive) {
            if (Math.abs(currentIndex - prevIndex) === 1) {
                backgroundAnimation =
                    currentIndex < prevIndex ? styles['slide-left'] : styles['slide-right'];
                textInAnimation =
                    currentIndex < prevIndex
                        ? styles['text-slide-in-right']
                        : styles['text-slide-in-left'];
            } else {
                backgroundAnimation = styles['appear-center'];
                textInAnimation = styles['appear-center'];
            }
        } else if (itemIndex === prevIndex) {
            if (Math.abs(currentIndex - prevIndex) === 1) {
                textOutAnimation =
                    currentIndex < prevIndex
                        ? styles['text-slide-out-left']
                        : styles['text-slide-out-right'];
            } else {
                textOutAnimation = styles['disappear-center'];
            }
        }
        return { backgroundAnimation, textOutAnimation, textInAnimation };
    };

    useEffect(() => {
        setPreviousPath(pathname);
    }, [pathname]);

    if (hideMobileNavBarPaths.some((path) => pathname.startsWith(path))) {
        return null;
    }

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex bg-gray-800 text-white py-4 px-6 rounded-full w-4/5 h-18">
            {navItems.map((item, index) => {
                const isActive = selectedPath.startsWith(item.href);
                const { backgroundAnimation, textOutAnimation, textInAnimation } =
                    getAnimationClasses(isActive, index);
                return (
                    <Link
                        href={item.href}
                        key={item.href}
                        prefetch={true}
                        onClick={() => onNavClick(item.href)}
                        className={`flex-1 flex justify-center ${isActive ? 'relative z-1' : ''}`}
                    >
                        <div
                            className={`flex items-center justify-center rounded-full h-full px-2 transition-all duration-500 ease-in-out ${backgroundAnimation} ${
                                isActive ? 'bg-green-500 px-6 py-4 w-auto' : 'w-12'
                            }`}
                        >
                            {React.cloneElement(item.icon, {
                                className: `h-9 w-9 transition-all duration-500 ease-in-out ${
                                    isActive ? 'text-white' : 'text-gray-300'
                                }`,
                            })}
                            {isActive && (
                                <span
                                    className={`ml-4 text-white text-2xl font-bold ${
                                        isActive ? textInAnimation : textOutAnimation
                                    }`}
                                >
                                    {item.label}
                                </span>
                            )}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};

export default MobileNavBar;
