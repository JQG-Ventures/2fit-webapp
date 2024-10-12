'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoChevronBack } from "react-icons/io5";
import { useRegister } from '../../_components/register/RegisterProvider';
import RegistrationHeader from '../../_components/header/registrationHeader';
import { useTranslation } from 'react-i18next';

export default function RegisterStep7() {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const [unit, setUnit] = useState('kg');
    const [targetWeight, setTargetWeight] = useState(data.target_weight || 70);
    const router = useRouter();

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
        <div className="flex flex-col h-screen bg-white p-10 lg:items-center">
            <div className='h-[10%] w-full lg:max-w-3xl'>
                <RegistrationHeader stepNumber={5} handlePrevStep={handlePrevStep}/>
            </div>
            
            <div className="h-[85%] content-center w-full lg:max-w-3xl">
                <h2 className="text-4xl font-bold text-center mb-20">{t('RegisterPagestep7.weight')}</h2>
                <div className="w-full px-8">
                    <div className="flex items-center bg-gray-100 rounded-full p-1 w-full max-w-xs mb-8 mx-auto justify-center">
                        <button
                            onClick={() => toggleUnit()}
                            className={`w-1/2 text-center py-2 rounded-full ${unit === 'lbs' ? 'bg-white text-black' : 'text-gray-500'}`}
                        >
                            {t('RegisterPagestep7.lbs')}
                        </button>
                        <button
                            onClick={() => toggleUnit()}
                            className={`w-1/2 text-center py-2 rounded-full ${unit === 'kg' ? 'bg-white text-black' : 'text-gray-500'}`}
                        >
                            {t('RegisterPagestep7.kilograms')}
                        </button>
                    </div>
                    <div className="flex items-center justify-center my-28">
                        <input
                            type="number"
                            value={targetWeight}
                            onChange={(e) => setTargetWeight(e.target.value)}
                            className="text-center text-4xl font-bold border rounded-md py-2 px-4 w-36"
                        />
                        <span className="ml-2 text-2xl text-gray-700">{unit}</span>
                    </div>
                    <div className="flex justify-center items-center">
                        <button
                            onClick={handleNextStep}
                            className="w-full max-w-xs sm:max-w-md py-3 bg-black text-white rounded-md font-semibold mt-10 flex justify-center items-center"
                        >
                            {t('RegisterPagestep7.nextbtn')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
