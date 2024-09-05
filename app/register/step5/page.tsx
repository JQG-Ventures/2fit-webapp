'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoChevronBack } from "react-icons/io5";
import { useRegister } from '../../_components/register/RegisterProvider';

export default function RegisterStep5() {
    const [unit, setUnit] = useState('cm');
    const [height, setHeight] = useState(175);
    const router = useRouter();
    const { updateData } = useRegister();

    const units = [
        { id: 'cm', label: 'Centimetre' },
        { id: 'ft', label: 'Feet' },
    ];

    const toggleUnit = (selectedUnit) => {
        if (selectedUnit !== unit) {
            const convertedHeight = selectedUnit === 'cm'
                ? Math.round(height * 30.48)
                : Math.round(height / 30.48);
            setUnit(selectedUnit);
            setHeight(convertedHeight);
        }
    };

    const handleNextStep = () => {
        // Convert the height to centimeters if the unit is feet
        const heightInCm = unit === 'ft' ? Math.round(height * 30.48) : height;

        // Update the registration data with the height in cm
        updateData({ height: heightInCm });

        // Navigate to the next step
        router.push('/register/step6');
    };

    const handlePrevStep = () => router.push('/register/step4');

    return (
        <div className="flex flex-col min-h-screen bg-white p-4">
            <div className="flex items-center justify-between px-4 mb-10 pt-16 sm:pt-24 md:pt-32">
                <button onClick={handlePrevStep} className="text-4xl">
                    <IoChevronBack />
                </button>
                <p className="text-2xl font-medium">Step 3 of 8</p>
                <button onClick={() => router.push('/next-step')} className="text-blue-500 text-2xl">Skip</button>
            </div>

            <div id="content" className="flex-grow flex flex-col items-center justify-center mt-[-100px]">
                <h2 className="text-4xl font-bold text-center mb-20">Select Height</h2>
                <div className="space-y-6 w-full px-8">
                    <div className="flex items-center bg-gray-100 rounded-full p-1 w-full max-w-xs mb-8 mx-auto justify-center">
                        {units.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => toggleUnit(id)}
                                className={`w-1/2 text-center py-2 rounded-full ${unit === id ? 'bg-white text-black' : 'text-gray-500'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center justify-center">
                        <input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="text-center text-4xl font-bold border rounded-md py-2 px-4 w-36"
                        />
                        <span className="ml-2 text-2xl text-gray-700">{unit}</span>
                    </div>
                    <div className="flex justify-center items-center pt-10">
                        <button
                            onClick={handleNextStep}
                            className="w-full max-w-xs sm:max-w-md py-3 bg-black text-white rounded-md font-semibold mt-10 flex justify-center items-center"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
