'use client';

import React from 'react';
import { FaSun, FaMoon, FaCloudSun } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const GreetingSection = ({ userName }: { userName: string }) => {
    const { t } = useTranslation('global');
    const currentHour = new Date().getHours();
    let greeting = t('home.greeting.morning');
    let icon = (
        <FaSun size={20} className="text-gray-400" aria-label={t('home.greeting.iconSunAria')} />
    );

    if (currentHour >= 12 && currentHour < 18) {
        greeting = t('home.greeting.afternoon');
        icon = <FaCloudSun size={24} aria-label={t('home.greeting.iconAfternoonAria')} />;
    } else if (currentHour >= 18) {
        greeting = t('home.greeting.evening');
        icon = (
            <FaMoon
                size={20}
                className="text-gray-400"
                aria-label={t('home.greeting.iconEveningAria')}
            />
        );
    }

    return (
        <section className="flex flex-col justify-center px-6 pt-6 pb-10 lg:min-h-0 lg:mt-40">
            <div className="flex items-center text-lg mb-2 text-gray-500">
                <p className="mr-3 font-normal leading-normal">{greeting}</p>
                <span className="shrink-0">{icon}</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl">
                {userName}
            </h1>
        </section>
    );
};

export default GreetingSection;
