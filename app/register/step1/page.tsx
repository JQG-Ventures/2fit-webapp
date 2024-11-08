'use client';

import React, { useState, useEffect } from 'react';
import { FaApple, FaFacebook, FaGoogle } from 'react-icons/fa';
import { IoChevronBack, IoCalendarOutline } from "react-icons/io5";
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import ButtonWithSpinner from '../../_components/others/ButtonWithSpinner';
import InputWithIcon from '../../_components/form/InputWithIcon';
import PhoneInput from '../../_components/form/PhoneInput';
import CountryInputForm from '../../_components/form/CountryInputForm';
import countryCodes from '@/app/data/countryCodes.json';
import { calculateAge } from '@/app/utils/formUtils';
import { sendCode } from '../../_services/registerService';
import { fetchUserDataByNumber } from '@/app/_services/userService';
import { useTranslation } from 'react-i18next';

interface FormData {
    number: string;
    name: string;
    age: string;
    country: string;
    birthdate: string;
    last: string;
}

interface ValidationErrors {
    [key: string]: string;
}

export default function RegisterStep1() {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const [countryCode, setCountryCode] = useState<string>(data.countryCode || '');
    const [phoneNumber, setPhoneNumber] = useState<string>(data.number || '');
    const [formData, setFormData] = useState<FormData>({
        number: data.number || '',
        name: data.name || '',
        age: data.age || '',
        country: data.country || '',
        birthdate: data.birthdate || '',
        last: data.last || ''
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const user_data_fields = [
        { name: 'name', label: 'Name', placeholder: t('RegisterPagestep1.name') },
        { name: 'last', label: 'Last', placeholder: t('RegisterPagestep1.last') },
        { name: 'birthdate', label: 'Birthdate', placeholder: 'mm/dd/yyyy', type: 'date' }
    ];

    const validatePhone = (phone: string): boolean => {
        const phoneRegex = /^\+?\d{8,15}$/;
        return phoneRegex.test(phone);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'countryCode') {
            setCountryCode(value);
        } else if (name === 'number') {
            setPhoneNumber(value);
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleCountryChange = (countryName: string) => {
        setFormData((prevFormData) => ({ ...prevFormData, country: countryName }));
        updateData({ ...formData, country: countryName });
    };

    const handleNextStep = async () => {
        setIsSubmitting(true);
        const validationErrors: ValidationErrors = {};

        if (!formData.name.trim()) {
            validationErrors.name = t("RegisterPagestep1.nameValidationFill");
        }

        if (!formData.last.trim()) {
            validationErrors.last = t("RegisterPagestep1.lastValidationFill");
        }

        if (!phoneNumber.trim()) {
            validationErrors.number = t("RegisterPagestep1.phoneValidationFill");
        } else if (!validatePhone(phoneNumber)) {
            validationErrors.number = t("RegisterPagestep1.phoneValidationInvalid");
        }

        if (!formData.birthdate) {
            validationErrors.birthdate = t("RegisterPagestep1.birthdateValidationFill");
        }

        if (!formData.country) {
            validationErrors.country = t("RegisterPagestep1.countryValidationFill");
        }

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            const extractedAge = calculateAge(formData.birthdate);
            const formattedPhoneNumber = `${countryCode}${phoneNumber}`.replace('+', '');
            const birthdateDate = new Date(formData.birthdate);
            const formattedBirthdate = birthdateDate.toISOString().replace('Z', '+00:00');

            const formattedData = { 
                ...formData, 
                age: extractedAge.toString(), 
                number: formattedPhoneNumber,
                birthdate: formattedBirthdate 
            };

            try {
                const existingUser = await fetchUserDataByNumber(formattedPhoneNumber);
                if (existingUser) {
                    setErrors({ number: t("RegisterPagestep1.numberRegisteredError") });
                    setIsSubmitting(false);
                    return;
                }
            } catch (error) {
                setErrors({ number: t("RegisterPagestep1.numberServerError") });
                setIsSubmitting(false);
                return;
            }

            setFormData(formattedData);
            updateData(formattedData);
            router.push('/register/step3');
        } else {
            setIsSubmitting(false);
        }
    };

    const handlePrevStep = () => router.push('/register');

    return (
        <div className="flex flex-col h-screen bg-white p-10 items-center">
            <div className='h-[10%] pt-20 w-full lg:max-w-3xl'>
                <button onClick={handlePrevStep} className="text-4xl lg:hidden">
                    <IoChevronBack />
                </button>
            </div>

            <div className='h-[15%] flex flex-row w-full lg:max-w-3xl mb-4'>
                <button onClick={handlePrevStep} className="hidden text-4xl lg:flex mr-14 mt-5 text-center">
                    <IoChevronBack />
                </button>
                <h1 className='text-6xl font-semibold'>
                    {t('RegisterPagestep1.create.0')} <br />
                    {t('RegisterPagestep1.create.1')}
                </h1>
            </div>

            <div className='h-[60%] flex w-full items-center justify-center'>
                <form className="w-full lg:max-w-3xl space-y-8">
                    {user_data_fields.map(({ name, label, placeholder, type }) => (
                        <InputWithIcon
                            key={name}
                            label={label}
                            name={name}
                            type={type || 'text'}
                            placeholder={placeholder}
                            value={formData[name]}
                            onChange={handleChange}
                            icon={name === 'birthdate' ? <IoCalendarOutline /> : undefined}
                        />
                    ))}
                    <CountryInputForm
                        selectedCountry={formData.country}
                        onChange={handleCountryChange}
                        countryList={countryCodes}
                    />
                    <PhoneInput
                        label={t('RegisterPagestep1.phone')}
                        countryCode={countryCode}
                        phoneNumber={phoneNumber}
                        onChange={handleChange}
                        countryCodes={countryCodes}
                        error={errors.number}
                    />
                    {errors.birthdate && <p className="text-red-500 text-center">{errors.birthdate}</p>}
                    {errors.name && <p className="text-red-500 text-center">{errors.name}</p>}
                    {errors.last && <p className="text-red-500 text-center">{errors.last}</p>}
                    {errors.number && <p className="text-red-500 text-center">{errors.number}</p>}
                    {errors.country && <p className="text-red-500 text-center">{errors.country}</p>}
                    {errors.server && <p className="text-red-500 text-center">{errors.server}</p>}
                    <ButtonWithSpinner
                        type="button"
                        onClick={handleNextStep}
                        loading={isSubmitting}
                        className="w-full bg-black text-white py-4 rounded-full text-xl font-semibold hover:bg-gray-800 transition duration-200 mt-4"
                    >
                        {t('RegisterPagestep1.nextbtn')}
                    </ButtonWithSpinner>
                </form>
            </div>

            <div className="h-[12%] flex flex-col justify-start text-center">
                <p className="text-gray-500 mb-6">{t('RegisterPagestep1.signuptxt')}</p>
                <div className="flex flex-row justify-evenly space-x-8">
                    {[FaApple, FaFacebook, FaGoogle].map((Icon, idx) => (
                        <button key={idx} className="text-5xl">
                            <Icon className={idx === 1 ? 'text-blue-600' : idx === 2 ? 'text-red-600' : 'text-gray-800'} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[3%] text-center">
                <p className="text-gray-500">
                    {t('RegisterPagestep1.signupquestion')} <a href="#" className="text-indigo-600 underline">{t('RegisterPagestep1.signin')}</a>
                </p>
            </div>
        </div>
    );
}
