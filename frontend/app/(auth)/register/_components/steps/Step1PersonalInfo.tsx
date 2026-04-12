'use client';

import React, { useState } from 'react';
import { useRegister } from '@/app/_components/register/RegisterProvider';
import InputWithIcon from '@/app/_components/form/InputWithIcon';
import CountryInputForm from '@/app/_components/form/CountryInputForm';
import PhoneNumberInput from '@/app/_components/form/PhoneNumberInput';
import countryCodes from '@/app/data/countryCodes.json';
import { calculateAge } from '@/app/utils/formUtils';
import { isPhoneAvailable } from '@/app/_services/userService';
import { useTranslation } from 'react-i18next';
import RegistrationHeader from '@/app/_components/register/RegistrationHeader';
import type { StepProps } from '@/app/(auth)/register/_components/RegisterWizard';

interface FormData {
    number: string;
    name: string;
    age: string;
    country: string;
    birthdate: string;
    last: string;
}

type RegisterStepOneField = 'name' | 'last' | 'birthdate';

export default function Step1PersonalInfo({ onNext, onPrev }: StepProps) {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const initialBirthdate = data.birthdate
        ? new Date(data.birthdate).toISOString().split('T')[0]
        : '';
    const [countryCode, setCountryCode] = useState<string>(data.countryCode || '1');
    const [phoneNumber, setPhoneNumber] = useState<string>(data.number || '');
    const [formData, setFormData] = useState<FormData>({
        number: data.number || '',
        name: data.name || '',
        age: data.age || '',
        country: data.country || '',
        birthdate: initialBirthdate,
        last: data.last || '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fields: Array<{
        name: RegisterStepOneField;
        placeholder: string;
        type?: string;
    }> = [
        { name: 'name', placeholder: t('RegisterPagestep1.name') },
        { name: 'last', placeholder: t('RegisterPagestep1.last') },
        { name: 'birthdate', placeholder: 'mm/dd/yyyy', type: 'date' },
    ];

    const validatePhone = (phone: string) => /^\+?\d{8,15}$/.test(phone);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        setFormData(updated);
        updateData({ ...updated, countryCode, number: phoneNumber });
    };

    const handleCountryChange = (countryName: string) => {
        const updated = { ...formData, country: countryName };
        setFormData(updated);
        updateData({ ...updated, countryCode, number: phoneNumber });
    };

    const handleCountryCodeChange = (code: string) => {
        setCountryCode(code);
        updateData({ ...formData, countryCode: code, number: phoneNumber });
    };

    const handlePhoneNumberChange = (number: string) => {
        setPhoneNumber(number);
        updateData({ ...formData, countryCode, number });
    };

    const handleNext = async () => {
        setIsSubmitting(true);
        const validationErrors: Record<string, string> = {};

        if (!formData.name.trim())
            validationErrors.name = t('RegisterPagestep1.nameValidationFill');
        if (!formData.last.trim())
            validationErrors.last = t('RegisterPagestep1.lastValidationFill');
        if (!phoneNumber.trim() || !validatePhone(`+${countryCode}${phoneNumber}`))
            validationErrors.number = t('RegisterPagestep1.phoneValidationFill');
        if (!formData.birthdate)
            validationErrors.birthdate = t('RegisterPagestep1.birthdateValidationFill');
        if (!formData.country)
            validationErrors.country = t('RegisterPagestep1.countryValidationFill');

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            setIsSubmitting(false);
            return;
        }

        const formattedPhoneNumber = `${countryCode}${phoneNumber}`.replace('+', '');
        try {
            const available = await isPhoneAvailable(formattedPhoneNumber);
            if (!available) {
                setErrors({ number: t('RegisterPagestep1.numberRegisteredError') });
                setIsSubmitting(false);
                return;
            }
        } catch {
            setErrors({ number: t('RegisterPagestep1.numberServerError') });
            setIsSubmitting(false);
            return;
        }

        const extractedAge = calculateAge(formData.birthdate);
        const birthdateDate = new Date(formData.birthdate);
        const formattedBirthdate = birthdateDate.toISOString().replace('Z', '+00:00');

        updateData({
            ...formData,
            age: extractedAge.toString(),
            code_number: countryCode.replace('+', ''),
            number: phoneNumber,
            birthdate: formattedBirthdate,
        });
        onNext();
    };

    return (
        <div className="flex flex-col flex-1 justify-between p-6">
            <div className="pt-4">
                <RegistrationHeader
                    title={
                        <>
                            {t('RegisterPagestep1.create.0')}
                            <br />
                            {t('RegisterPagestep1.create.1')}
                        </>
                    }
                    description=""
                />
            </div>

            <form className="flex flex-col gap-5 py-6">
                {fields.map(({ name, placeholder, type }) => (
                    <InputWithIcon
                        key={name}
                        label=""
                        name={name}
                        type={type || 'text'}
                        placeholder={placeholder}
                        value={formData[name]}
                        onChange={handleChange}
                        error={errors[name]}
                    />
                ))}

                <CountryInputForm
                    selectedCountry={formData.country}
                    onChange={handleCountryChange}
                    countryList={countryCodes}
                    error={errors.country}
                />

                <PhoneNumberInput
                    countryCode={countryCode}
                    phoneNumber={phoneNumber}
                    onCountryCodeChange={handleCountryCodeChange}
                    onPhoneNumberChange={handlePhoneNumberChange}
                    countryList={countryCodes}
                    error={errors.number}
                />
            </form>

            <div className="flex gap-4 pb-2">
                <button
                    type="button"
                    onClick={onPrev}
                    className="flex-1 border border-gray-300 text-gray-700 py-[18px] rounded-full text-[17px] font-bold hover:bg-gray-50 transition duration-200"
                >
                    {t('RegisterPage.back')}
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex-1 bg-black text-white py-[18px] rounded-full text-[17px] font-bold hover:bg-gray-800 transition duration-200 disabled:opacity-40"
                >
                    {isSubmitting ? '...' : t('RegisterPagestep1.nextbtn')}
                </button>
            </div>
        </div>
    );
}
