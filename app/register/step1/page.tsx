'use client';

import React, { useState } from 'react';
import { FaApple, FaFacebook, FaGoogle } from 'react-icons/fa';
import { IoChevronBack } from "react-icons/io5";
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import ButtonWithSpinner from '../../_components/others/ButtonWithSpinner';
import InputWithIcon from '../../_components/form/InputWithIcon';
import { IoCalendarOutline } from 'react-icons/io5';
import { sendCode } from '../../_services/registerService';
import PhoneInput from '../../_components/form/PhoneInput';
import countryCodes from '@/app/data/countryCodes.json';
import { calculateAge } from '@/app/utils/formUtils';
import { fetchUserDataByNumber } from '@/app/_services/userService';

interface FormData {
    number: string;
    name: string;
    age: string;
    birthdate: string;
    last: string;
}

interface ValidationErrors {
    [key: string]: string;
}

export default function RegisterStep1() {
    const { data, updateData } = useRegister();
    const [error, setError] = useState('');
    const [countryCode, setCountryCode] = useState<string>(data.countryCode || '');
    const [phoneNumber, setPhoneNumber] = useState<string>(data.number || '');
    const [formData, setFormData] = useState<FormData>({
        number: data.number || '',
        name: data.name || '',
        age: data.age || '',
        birthdate: data.birthdate || '',
        last: data.last || ''
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const user_data_fields = [
        { name: 'name', label: 'Name', placeholder: 'Name', type: 'text' },
        { name: 'last', label: 'Last', placeholder: 'Last', type: 'text' },
        { name: 'birthdate', label: 'Birthdate', placeholder: 'mm/dd/yyyy', type: 'date' }
    ];

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

    const validatePhone = (phone: string) => /^\d{8,15}$/.test(phone);

    const handleNextStep = async () => {
        setIsSubmitting(true);
        const validationErrors: ValidationErrors = {};

        if (!formData.name) {
            validationErrors.name = 'Please fill out this field.';
        }
        if (!formData.last) {
            validationErrors.last = 'Please fill out this field.';
        }
        if (!phoneNumber || !validatePhone(phoneNumber)) {
            validationErrors.number = 'Please enter a valid phone number.';
        }

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            const extractedAge = calculateAge(formData.birthdate);
            const formattedPhoneNumber = `${countryCode}${phoneNumber}`.replace('+', '');
            const formattedData = { ...formData, age: extractedAge, number: formattedPhoneNumber };

            try {
                const existingUser = await fetchUserDataByNumber(formattedPhoneNumber);
                if (existingUser) {
                    setErrors({ number: 'Number is already registered. Please use a different one.' });
                    setIsSubmitting(false);
                    return;
                }
            } catch (error) {
                setErrors({ number: 'There was an error checking the number. Please try again later.' });
                setIsSubmitting(false);
                return;
            }

            setFormData(formattedData);
            updateData(formattedData);

            // Uncomment these lines to handle sending the code and proceeding to the next step
            // const response_code = await sendCode(formattedData.number);
            // if (response_code === 200) {
            //     router.push('/register/step2');
            // } else {
            //     setError(response_code === 400 ? 
            //         'The number entered is not valid. Please try another one.' :
            //         'There was a problem sending the code. Please try again later.'
            //     );
            // }

            router.push('/register/step2');
        } else {
            setIsSubmitting(false);
        }
    };

    const handlePrevStep = () => router.push('/register');

    return (
        <div className="flex flex-col h-screen bg-white p-10 items-center">
            <div className='h-[15%] pt-20 w-full lg:max-w-3xl'>
                <button onClick={handlePrevStep} className="text-4xl lg:hidden">
                    <IoChevronBack />
                </button>
            </div>

            <div className='h-[15%] flex flex-row w-full lg:max-w-3xl'>
                <button onClick={handlePrevStep} className="hidden text-4xl lg:flex mr-14 mt-5 text-center">
                    <IoChevronBack />
                </button>
                <h1 className='text-6xl font-semibold'>Create your <br />Account</h1>
            </div>

            <div className='h-[50%] flex w-full items-center justify-center'>
                <form className="w-full lg:max-w-3xl space-y-8">
                    {user_data_fields.map(({ name, label, placeholder, type }) => (
                        <InputWithIcon
                            key={name}
                            label={label}
                            name={name}
                            type={type}
                            placeholder={placeholder}
                            value={formData[name]}
                            onChange={handleChange}
                            icon={name === 'birthdate' ? IoCalendarOutline : undefined}
                        />
                    ))}
                    <PhoneInput
                        label="Phone Number"
                        countryCode={countryCode}
                        phoneNumber={phoneNumber}
                        onChange={handleChange}
                        countryCodes={countryCodes}
                    />
                    {errors.number && <p className="text-red-500 text-center">{errors.number}</p>}
                    <ButtonWithSpinner
                        type="button"
                        onClick={handleNextStep}
                        loading={isSubmitting}
                        className="w-full bg-black text-white py-4 rounded-full text-1xl font-semibold hover:bg-gray-800 transition duration-200 mt-4"
                    >
                        Next
                    </ButtonWithSpinner>
                </form>
            </div>

            <div className="h-[15%] flex flex-col justify-start text-center">
                <p className="text-gray-500 mb-10">Or sign in with</p>
                <div className="flex flex-row justify-evenly space-x-8">
                    {[FaApple, FaFacebook, FaGoogle].map((Icon, idx) => (
                        <button key={idx} className="text-5xl">
                            <Icon className={idx === 1 ? 'text-blue-600' : idx === 2 ? 'text-red-600' : ''} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[5%] text-center">
                <p className="text-gray-500">
                    Do you have an account? <a href="#" className="text-indigo-600 underline">Sign In</a>
                </p>
            </div>
        </div>
    );
}
