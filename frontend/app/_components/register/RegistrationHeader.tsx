'use client';

import React from 'react';

interface RegistrationHeaderProps {
    title: React.ReactNode;
    description: string;
}

const RegistrationHeader: React.FC<RegistrationHeaderProps> = ({ title, description }) => {
    return (
        <div className="flex flex-col">
            <h2 className="text-5xl font-bold text-black leading-[1.15] tracking-[-0.02em]">
                {title}
            </h2>
            <p className="text-gray-400 text-[15px] mt-3 leading-relaxed">{description}</p>
        </div>
    );
};

export default RegistrationHeader;
