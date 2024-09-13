'use client';

import React, { useState } from 'react';
import { FaApple, FaFacebook, FaGoogle } from 'react-icons/fa';
import { IoChevronBack } from "react-icons/io5";
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider'; 

export default function RegisterStep1() {
    const { updateData } = useRegister();
    const [formData, setFormData] = useState({
        number: '',
        email: '',
        name: '',
        last: '',
        password: '',
        age: ''
    });
    const [isChecked, setIsChecked] = useState(false);
    const [errors, setErrors] = useState({});
    const router = useRouter();

    // Add age to user_data_fields array
    const user_data_fields = [
        { name: 'name', label: 'Name', placeholder: 'Name' },
        { name: 'last', label: 'Last', placeholder: 'Last' },
        { name: 'email', label: 'Email', placeholder: 'Email' },
        { name: 'number', label: 'Phone', placeholder: 'Phone' },
        { name: 'password', label: 'Password', placeholder: '******************', type: 'password' },
        { name: 'age', label: 'Age', placeholder: 'Age', type: 'number' } 
    ];

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

    const validatePassword = (password: string) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])[A-Za-z\d\W]{8,}$/.test(password);
        
    const validatePhone = (phone: string) => /^\d{8,15}$/.test(phone);

    const validateAge = (age: string) => /^\d+$/.test(age) && parseInt(age) > 0;

    const handleNextStep = () => {
        const validationErrors = {};

        if (!formData.name) validationErrors.name = 'Please fill out this field.';
        if (!formData.last) validationErrors.last = 'Please fill out this field.';
        if (!formData.email || !validateEmail(formData.email)) {
            validationErrors.email = 'Please enter a valid email address.';
        }
        if (!formData.number || !validatePhone(formData.number)) {
            validationErrors.number = 'Please enter a valid phone number.';
        }
        if (!formData.password || !validatePassword(formData.password)) {
            validationErrors.password = 'Password must contain uppercase, lowercase, number, and special character.';
        }
        if (!formData.age || !validateAge(formData.age)) {
            validationErrors.age = 'Please enter a valid age.';
        }

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            updateData(formData);
            router.push('/register/step2');
        }
    };

    const handlePrevStep = () => router.push('/');

    return (
        <div className="min-h-screen flex flex-col justify-between bg-white py-6">
            <div className="flex-grow flex flex-col justify-center items-center">
                <div className='flex items-center justify-between mb-12'>
                    <button onClick={handlePrevStep} className="absolute left-6 text-6xl">
                        <IoChevronBack />
                    </button>
                    <h2 className="text-4xl font-bold text-center flex-grow">Sign Up</h2>
                </div>

                <form className="sm:w-full lg:max-w-3xl space-y-4 px-8 mt-20">
                    {user_data_fields.map(({ name, label, placeholder, type = 'text' }) => (
                        <div key={name} className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full px-3">
                                <input
                                    className={`appearance-none block w-full bg-gray-200 text-gray-700 border ${errors[name] ? 'border-red-500' : 'border-gray-200'} rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white`}
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
                    <div className='flex flex-col space-between mt-10'>
                        <div className="flex items-start mt-12">
                            <input
                                type="checkbox"
                                id="terms"
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                            className={`w-full py-3 bg-black text-white rounded-md font-semibold mt-4 ${!isChecked ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!isChecked}
                        >
                            Next
                        </button>
                    </div>
                </form>
            </div>

            <div>
                <div className="flex justify-center mb-12">
                    <div className="text-center">
                        <p className="text-gray-500 mb-12">Or sign in with</p>
                        <div className="flex justify-center space-x-8">
                            {[FaApple, FaFacebook, FaGoogle].map((Icon, idx) => (
                                <button key={idx} className="text-6xl">
                                    <Icon className={idx === 1 ? 'text-blue-600' : idx === 2 ? 'text-red-600' : ''} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="text-center mt-auto mb-4">
                    <p className="text-gray-500">
                        Do you have an account? <a href="#" className="text-indigo-600 underline">Sign In</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
