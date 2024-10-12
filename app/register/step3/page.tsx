'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import RegistrationHeader from '../../_components/header/registrationHeader';
import { useTranslation } from 'react-i18next';

export default function RegisterStep3() {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const router = useRouter();
    const [selectedGender, setSelectedGender] = useState(data.gender);   
    const genders = [
        { id: 0, label: t('RegisterPagestep3.woman'), icon: '👩' },
        { id: 1, label: t('RegisterPagestep3.man'), icon: '👨' },
        { id: 2, label: t('RegisterPagestep3.neutral'), icon: '🧑' },
    ];

    const handleGenderSelection = (genderId: number) => {
        setSelectedGender(genderId);
        updateData({ gender: genderId });
        console.log(data);
        setTimeout(() => {
            router.push('/register/step4');
        }, 300);
    };

    const handlePrevStep = () => {
        router.push('/register/step2')
    };

    return (
        <div className="flex flex-col h-screen bg-white p-10 lg:items-center">
            <div className='h-[10%] w-full lg:max-w-3xl'>
                <RegistrationHeader stepNumber={1} handlePrevStep={handlePrevStep}/>
            </div>

            <div className="h-[85%] content-center w-full lg:max-w-3xl">
                <h2 className="text-4xl font-bold text-center mb-20">{t('RegisterPagestep3.gender')}</h2>
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
