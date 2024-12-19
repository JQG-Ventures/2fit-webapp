'use client';

import React from 'react';

interface RegistrationHeaderProps {
    title: string;
    description: string;
}

const RegistrationHeader: React.FC<RegistrationHeaderProps> = ({ title, description }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full space-y-6 sm:pt-24 md:pt-32">
            <h2 className="text-4xl font-bold">{title}</h2>
            <span className="text-center">{description}</span>
        </div>
    );
};

export default RegistrationHeader;
