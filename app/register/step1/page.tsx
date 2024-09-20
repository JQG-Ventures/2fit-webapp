'use client';

import React, { useState } from 'react';
import { FaApple, FaFacebook, FaGoogle } from 'react-icons/fa';
import { IoChevronBack } from "react-icons/io5";
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import { sendCode } from '../../_services/registerService';

interface FormData {
    number: string;
    name: string;
    age: string;
    last: string;
}

interface ValidationErrors {
    [key: string]: string;
}

export default function RegisterStep1() {
    const { data, updateData } = useRegister();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<FormData>({
        number: data.number || '',
        name: data.name || '',
        age: data.age || '',
        last: data.last || ''
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const router = useRouter();

    const user_data_fields = [
        { name: 'name', label: 'Name', placeholder: 'Name' },
        { name: 'last', label: 'Last', placeholder: 'Last' },
        { name: 'age', label: 'Age', placeholder: 'Age' },
        { name: 'number', label: 'Phone', placeholder: 'Phone' }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validatePhone = (phone: string) => /^\d{8,15}$/.test(phone);

    const handleNextStep = async () => {
        const validationErrors: ValidationErrors = {};

        if (!formData.name) validationErrors.name = 'Please fill out this field.';
        if (!formData.last) validationErrors.last = 'Please fill out this field.';
        if (!formData.number || !validatePhone(formData.number)) {
            validationErrors.number = 'Please enter a valid phone number.';
        }

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            updateData(formData);
            router.push('/register/step2');
            // const response_code = await sendCode(formData.number)

            // if (response_code == 200) {
            //     router.push('/register/step2');
            // } else {
            //     if (response_code == 400) {
            //         setError('The number entered is not valid. Please try another one.');
            //     } else {
            //         setError('There was a problem sending the code. Please try again later.');
            //     }
            // }
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
                <form className="w-full lg:max-w-3xl">
                    {user_data_fields.map(({ name, label, placeholder, type = 'text' }) => (
                        <div key={name} className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full px-3">
                                <input
                                    className={`appearance-none py-6 text-2xl block w-full bg-gray-200 text-gray-700 border ${errors[name] ? 'border-red-500' : 'border-gray-200'} rounded-lg py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white`}
                                    id={`grid-${name}`}
                                    type={type}
                                    name={name}
                                    placeholder={placeholder}
                                    value={formData[name]}
                                    onChange={handleChange}
                                />
                                {errors[name] && <p className="text-red-500 text-xs italic">{errors[name]}</p>}
                            </div>
                        </div>
                    ))}
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <button
                        type="button"
                        onClick={handleNextStep}
                        className={`w-full py-3 bg-black text-white rounded-full font-semibold mt-4`}
                    >
                        Next
                    </button>
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
