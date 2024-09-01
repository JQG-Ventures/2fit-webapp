'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoChevronBack } from "react-icons/io5";
import { useRegister } from '../../_components/register/RegisterProvider';

export default function RegisterStep3() {
    const [selectedGender, setSelectedGender] = useState(null);
    const router = useRouter();
    const { updateData } = useRegister();

    const genders = [
        { id: 0, label: 'Woman', icon: '👩' },
        { id: 1, label: 'Man', icon: '👨' },
        { id: 2, label: 'Gender neutral', icon: '🧑' },
    ];

    const handleGenderSelection = (genderId) => {
        setSelectedGender(genderId); // Update the selected gender ID
        updateData({ gender: genderId }); // Save the gender ID in the context
        setTimeout(() => {
            router.push('/register/step4');
        }, 300);
    };

    const handlePrevStep = () => router.push('/register/step2');

    return (
        <div className="flex flex-col min-h-screen bg-white p-4">
            <div className="flex items-center justify-between px-4 mb-10 pt-16 sm:pt-24 md:pt-32">
                <button onClick={handlePrevStep} className="text-4xl">
                    <IoChevronBack />
                </button>
                <p className="text-2xl font-medium">Step 1 of 8</p>
                <button onClick={() => router.push('/next-step')} className="text-blue-500 text-2xl">Skip</button>
            </div>

            {/* Main content */}
            <div className="flex-grow flex flex-col items-center justify-center">
                <h2 className="text-4xl font-bold text-center mb-20">Choose gender</h2>
                <div className="space-y-6 w-full px-8">
                    {genders.map(({ id, label, icon }) => (
                        <button
                            key={id}
                            className={`w-full p-8 flex text-left items-center border rounded-lg text-3xl ${selectedGender === id ? 'border-black bg-gray-100' : 'border-gray-300'}`}
                            onClick={() => handleGenderSelection(id)}
                        >
                            <span role="img" aria-label={label} className="mr-4">{icon}</span> {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
