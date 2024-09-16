'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { IoChevronBack } from "react-icons/io5";

export default function RegistrationHeader({stepNumber, handlePrevStep}) {
    const router = useRouter();
    const handleSkip = () => {
        router.push('/skip')
    };

    return (
        <div className="flex items-center justify-between px-4 mb-10 pt-16 sm:pt-24 md:pt-32">
            <button onClick={() => handlePrevStep()} className="text-4xl z-10">
                <IoChevronBack />
            </button>
            <p className="text-2xl font-medium">Step {stepNumber} of 8</p>
            <button onClick={() => handleSkip()} className="text-blue-500 text-2xl">Skip</button>
        </div>
    );
}
