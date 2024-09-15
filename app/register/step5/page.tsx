'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import RegistrationHeader from '../../_components/header/registrationHeader';

export default function RegisterStep5() {
    const { data, updateData } = useRegister();
    const [unit, setUnit] = useState('cm');
    const [height, setHeight] = useState(data.height || 175);
    const router = useRouter();

    const units = [
        { id: 'cm', label: 'Centimetre' },
        { id: 'ft', label: 'Feet' },
    ];

    const toggleUnit = (selectedUnit: string) => {
        if (selectedUnit !== unit) {
            const convertedHeight = selectedUnit === 'cm'
                ? Math.round(height * 30.48)
                : Math.round(height / 30.48);
            setUnit(selectedUnit);
            setHeight(convertedHeight);
        }
    };

    const handleNextStep = () => {
        const heightInCm = unit === 'ft' ? Math.round(height * 30.48) : height;

        updateData({ height: heightInCm });
        router.push('/register/step6');
    };

    const handlePrevStep = () => {
        router.push('/register/step4')
    };

    return (
        <div className="flex flex-col h-screen bg-white p-4">
            <div className='h-[10%]'>
                <RegistrationHeader stepNumber={3} handlePrevStep={handlePrevStep}/>
            </div>

            <div className="h-[85%] content-center">
                <h2 className="text-4xl font-bold text-center mb-20">Select Height</h2>
                <div className="w-full px-8">
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
                    <div className="flex items-center justify-center my-28">
                        <input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="text-center text-4xl font-bold border rounded-md py-2 px-4 w-36"
                        />
                        <span className="ml-2 text-2xl text-gray-700">{unit}</span>
                    </div>
                    <div className="flex justify-center items-center">
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
