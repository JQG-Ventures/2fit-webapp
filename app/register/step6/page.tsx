'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import RegistrationHeader from '../../_components/header/registrationHeader';
import { useTranslation } from 'react-i18next';

export default function RegisterStep6() {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const [unit, setUnit] = useState('kg');
    const [weight, setWeight] = useState(data.weight || 70);
    const router = useRouter();

    const toggleUnit = () => {
        if (unit === 'kg') {
            setUnit('lbs');
            setWeight(Math.round(weight * 2.20462)); // Convert kg to lbs
        } else {
            setUnit('kg');
            setWeight(Math.round(weight / 2.20462)); // Convert lbs to kg
        }
    };

    const handleNextStep = () => {
        const weightInKg = unit === 'lbs' ? Math.round(weight / 2.20462) : weight;

        updateData({ weight: weightInKg });

        router.push('/register/step7');
    };

    const handlePrevStep = () => {
        router.push('/register/step5');
    };

    return (
        <div className="flex flex-col h-screen bg-white p-10 lg:items-center">
            <div className='h-[10%] w-full lg:max-w-3xl'>
                <RegistrationHeader stepNumber={4} handlePrevStep={handlePrevStep}/>
            </div>
            
            <div className="h-[85%] content-center w-full lg:max-w-3xl">
                <h2 className="text-4xl font-bold text-center mb-20">{t('RegisterPagestep6.weight')}</h2>
                <div className="w-full px-8">
                    <div className="flex items-center bg-gray-100 rounded-full p-1 w-full max-w-xs mb-8 mx-auto justify-center">
                        <button
                            onClick={() => toggleUnit()}
                            className={`w-1/2 text-center py-2 rounded-full ${unit === 'lbs' ? 'bg-white text-black' : 'text-gray-500'}`}
                        >
                            {t('RegisterPagestep6.lbs')}
                        </button>
                        <button
                            onClick={() => toggleUnit()}
                            className={`w-1/2 text-center py-2 rounded-full ${unit === 'kg' ? 'bg-white text-black' : 'text-gray-500'}`}
                        >
                            {t('RegisterPagestep6.kilograms')}
                        </button>
                    </div>
                    <div className="flex items-center justify-center my-28">
                        <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="text-center text-4xl font-bold border rounded-md py-2 px-4 w-36"
                        />
                        <span className="ml-2 text-2xl text-gray-700">{unit}</span>
                    </div>
                    <div className="flex justify-center items-center">
                        <button
                            onClick={handleNextStep}
                            className="w-full max-w-xs sm:max-w-md py-3 bg-black text-white rounded-md font-semibold mt-10 flex justify-center items-center"
                        >
                            {t('RegisterPagestep6.nextbtn')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
