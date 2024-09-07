'use client';

import React from 'react';
import { FaSun, FaMoon, FaCloudSun } from 'react-icons/fa';

const GreetingSection = ({ userName }: { userName: string }) => {
    const currentHour = new Date().getHours();
    let greeting = 'Good Morning';
    let icon = <FaSun size={24} />;

    if (currentHour >= 12 && currentHour < 18) {
        greeting = 'Good Afternoon';
        icon = <FaCloudSun size={24} />;
    } else if (currentHour >= 18) {
        greeting = 'Good Evening';
        icon = <FaMoon size={24} />;
    }

    return (
        <div className="p-6 pt-[5vh] md:px-12 lg:px-20 pt-40">
            <div className="flex items-center text-2xl mb-6 text-gray-500 lg:text-3xl">
                <p className="mr-4">{greeting}</p>
                <span>{icon}</span>
            </div>
            <h1 className="text-5xl font-bold mt-2 lg:text-6xl">{userName}</h1>
        </div>
    );
};

export default GreetingSection;
