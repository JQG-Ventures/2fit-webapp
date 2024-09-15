'use client';

import React, { useState } from 'react';
import { FaApple, FaFacebook, FaGoogle } from 'react-icons/fa';
import { IoChevronBack } from "react-icons/io5";
import { useRouter } from 'next/navigation';
import { useRegister } from '../_components/register/RegisterProvider';


export default function RegisterStep1() {
    const { data, updateData } = useRegister();
    const [formData, setFormData] = useState({
        email: data.email || '',
        password: data.password || '',
    });
    const [isChecked, setIsChecked] = useState(false);
    const [errors, setErrors] = useState({});
    const router = useRouter();

    const user_data_fields = [
        { name: 'email', label: 'Email', placeholder: 'Email' },
        { name: 'password', label: 'Password', placeholder: '******************', type: 'password' }
    ];

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

    const validatePassword = (password: string) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])[A-Za-z\d\W]{8,}$/.test(password);

    const validatePhone = (phone: string) => /^\d{8,15}$/.test(phone);

    const handleNextStep = () => {
        const validationErrors: any = {};

        if (!formData.email || !validateEmail(formData.email)) {
            validationErrors.email = 'Please enter a valid email address.';
        }
        if (!formData.password || !validatePassword(formData.password)) {
            validationErrors.password = 'Password must contain uppercase, lowercase, number, and special character.';
        }

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            updateData(formData);
            router.push('/register/step1');
        }
    };

    const handlePrevStep = () => router.push('/');

    return (
        <div className="flex flex-col h-screen bg-white p-10 justify-between">
            <div className='h-[15%] pt-20'>
                <button onClick={handlePrevStep} className="text-4xl">
                    <IoChevronBack />
                </button>
            </div>

            <div className='h-[15%]'>
                <h1 className='text-6xl font-semibold'>Create your <br />Account</h1>
            </div>

            <div className='h-[50%] flex items-center justify-center'>
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
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                                {errors.name && <p className="text-red-500 text-xs italic">{errors[name]}</p>}
                            </div>
                        </div>
                    ))}
                    <div className="flex items-start my-6">
                        <input
                            type="checkbox"
                            id="terms"
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded-lg focus:ring-indigo-500"
                            checked={isChecked}
                            onChange={() => setIsChecked(!isChecked)}
                        />
                        <label htmlFor="terms" className="ml-2 text-lg text-gray-500">
                            By continuing you accept our <a href="#" className="text-indigo-600 underline">Privacy Policy</a>
                        </label>
                    </div>
                    <button
                        type="button"
                        onClick={handleNextStep}
                        className={`w-full py-3 bg-black text-white rounded-full font-semibold mt-4 ${!isChecked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!isChecked}
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

            <div className="h-[5%] text-center content-center">
                <p className="text-gray-500">
                    Do you have an account? <a href="#" className="text-indigo-600 underline">Sign In</a>
                </p>
            </div>
        </div>
    );
}
