'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoChevronBack } from "react-icons/io5";
import { useRegister } from '../../_components/register/RegisterProvider'; // Adjust this path as needed

export default function RegisterStep7() {
    const [unit, setUnit] = useState('kg');
    const [targetWeight, setTargetWeight] = useState(70);
    const router = useRouter();
    const { updateData } = useRegister();

    const toggleUnit = () => {
        if (unit === 'kg') {
            setUnit('lbs');
            setTargetWeight(Math.round(targetWeight * 2.20462));
        } else {
            setUnit('kg');
            setTargetWeight(Math.round(targetWeight / 2.20462));
        }
    };

    const handleNextStep = () => {
        const targetWeightInKg = unit === 'lbs' ? Math.round(targetWeight / 2.20462) : targetWeight;

        updateData({ target_weight: targetWeightInKg });

        router.push('/register/step8');
    };

    const handlePrevStep = () => {
        router.push('/register/step6');
    };

    return (
        <div className="flex flex-col min-h-screen bg-white p-4">
            <div className="flex items-center justify-between px-4 mb-10 pt-16 sm:pt-24 md:pt-32">
                <button onClick={() => handlePrevStep()} className="text-4xl">
                    <IoChevronBack />
                </button>
                <p className="text-2xl font-medium">Step 5 of 8</p>
                <button onClick={() => router.push('/next-step')} className="text-blue-500 text-2xl">Skip</button>
            </div>

            <div id="content" className="flex-grow flex flex-col items-center justify-center mt-[-100px]">
                <h2 className="text-4xl font-bold text-center mb-20">Select Target Weight</h2>
                <div className="space-y-6 w-full px-8">
                    <div className="flex items-center bg-gray-100 rounded-full p-1 w-full max-w-xs mb-8 mx-auto justify-center">
                        <button
                            onClick={() => toggleUnit()}
                            className={`w-1/2 text-center py-2 rounded-full ${unit === 'lbs' ? 'bg-white text-black' : 'text-gray-500'}`}
                        >
                            Lbs
                        </button>
                        <button
                            onClick={() => toggleUnit()}
                            className={`w-1/2 text-center py-2 rounded-full ${unit === 'kg' ? 'bg-white text-black' : 'text-gray-500'}`}
                        >
                            Kilograms
                        </button>
                    </div>
                    <div className="flex items-center justify-center">
                        <input
                            type="number"
                            value={targetWeight}
                            onChange={(e) => setTargetWeight(e.target.value)}
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
