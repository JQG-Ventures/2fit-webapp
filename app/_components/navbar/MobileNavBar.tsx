import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './NavBar.module.css';

type MobileNavBarProps = {
    navItems: Array<{ href: string; label: string; icon: JSX.Element }>;
    currentPage: string;
};

const MobileNavBar: React.FC<MobileNavBarProps> = ({ navItems, currentPage }) => {
    const pathname = usePathname();
    const [previousPath, setPreviousPath] = useState(pathname);

    const getAnimationClasses = (isActive: boolean, itemIndex: number) => {
        const currentIndex = navItems.findIndex(item => pathname.startsWith(item.href));
        const prevIndex = navItems.findIndex(item => previousPath.startsWith(item.href));

        let backgroundAnimation = '';
        let textOutAnimation = '';
        let textInAnimation = '';

        if (isActive) {
            if (Math.abs(currentIndex - prevIndex) === 1) {
                if (currentIndex < prevIndex) {
                    backgroundAnimation = styles['slide-left'];
                    textInAnimation = styles['text-slide-in-right'];
                } else if (currentIndex > prevIndex) {
                    backgroundAnimation = styles['slide-right'];
                    textInAnimation = styles['text-slide-in-left'];
                }
            } else if (currentIndex !== prevIndex) {
                backgroundAnimation = styles['appear-center'];
                textInAnimation = styles['appear-center'];
            }
        } else if (itemIndex === prevIndex) {
            if (Math.abs(currentIndex - prevIndex) === 1) {
                if (currentIndex < prevIndex) {
                    textOutAnimation = styles['text-slide-out-left'];
                } else if (currentIndex > prevIndex) {
                    textOutAnimation = styles['text-slide-out-right'];
                }
            } else {
                textOutAnimation = styles['disappear-center'];
            }
        }

        return {
            backgroundAnimation,
            textOutAnimation,
            textInAnimation,
        };
    };

    useEffect(() => {
        setPreviousPath(pathname);
    }, [pathname]);

    return (
        <nav className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex bg-gray-800 text-white py-4 px-6 rounded-full w-4/5 h-18">
            {navItems.map((item, index) => {
                const isActive = pathname.startsWith(item.href);
                const { backgroundAnimation, textOutAnimation, textInAnimation } = getAnimationClasses(isActive, index);

                return (
                    <Link
                        href={item.href}
                        key={item.href}
                        className={`flex-1 flex justify-center ${isActive ? 'relative z-10' : ''}`}
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
        </nav>
    );
};

export default MobileNavBar;
