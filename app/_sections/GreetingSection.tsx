'use client';

import React from 'react';
import { FaSun, FaMoon, FaCloudSun } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const GreetingSection = ({ userName }: { userName: string }) => {
    const currentHour = new Date().getHours();
    const { t } = useTranslation('global'); // Asegúrate de usar el namespace correcto
    let greeting = t('greetingmorning');
    let icon = <FaSun size={24} aria-label="Sun icon" />;

    if (currentHour >= 12 && currentHour < 18) {
        greeting = t('greetingafternoon');
        icon = <FaCloudSun size={24} aria-label="Cloud Sun icon" />;
    } else if (currentHour >= 18) {
        greeting = t('greetingevening');
        icon = <FaMoon size={24} aria-label="Moon icon" />;
    }

    return (
        <section className="p-6 pt-[5vh] my-10 ml-5 md:px-12 lg:px-20 lg:mt-40">
            <div className="flex items-center text-2xl mb-6 text-gray-500 lg:text-3xl">
                <p className="mr-4">{greeting}</p>
                <span>{icon}</span>
            </div>
            <h1 className="text-5xl font-bold mt-2 lg:text-6xl">{userName}</h1>
        </section>
    );
};

export default GreetingSection;
