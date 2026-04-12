'use client';

import React from 'react';
import { FaDumbbell, FaBell } from 'react-icons/fa';
import SearchBar from '@/app/_components/searchbar/SearchBarComponent';
import { useTranslation } from 'react-i18next';

const MobileTopBar: React.FC = () => {
    const { t } = useTranslation('global');

    return (
        <header className="flex items-center justify-between px-6 py-10 bg-white">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500">
                    <FaDumbbell className="text-white text-2xl" />
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">
                    {t('home.topBar.brand')}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label={t('home.topBar.notifications')}
                >
                    <FaBell className="text-gray-600 text-3xl" />
                </button>
                <div className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-gray-100 transition-colors">
                    <SearchBar />
                </div>
            </div>
        </header>
    );
};

export default MobileTopBar;
