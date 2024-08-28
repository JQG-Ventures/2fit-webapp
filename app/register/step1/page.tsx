'use client';

import React, { useState } from 'react';
import { FaApple, FaFacebook, FaGoogle } from 'react-icons/fa';
import { IoChevronBack } from "react-icons/io5";
import { useRouter } from 'next/navigation';

export default function RegisterStep1() {
    const [phone, setPhone] = useState('');
    const router = useRouter();

    const handleNextStep = () => {
        // Lógica para verificar el número de teléfono o guardarlo temporalmente
        router.push('/register/step2');
    };

    const handlePrevStep = () => {
        // Lógica para verificar el número de teléfono o guardarlo temporalmente
        router.push('/');
    };

    return (
        <div className="min-h-screen flex flex-col justify-between bg-white py-6">
            <div className="flex-grow flex flex-col basis-3/4 justify-center items-center">
                <div className='flex items-center justify-between mb-12'>
                    <button
                        onClick={handlePrevStep}
                        className="absolute left-6 text-6xl"
                    >
                        <IoChevronBack />
                    </button>
                    <h2 className="text-4xl font-bold text-center flex-grow">Sign Up</h2>
                </div>

                <form className="sm:w-full md:max-w-xl space-y-4 px-8 mt-20">
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" id="grid-first-name" type="text" placeholder="Name" />
                            <p className="text-red-500 text-xs italic">Please fill out this field.</p>
                        </div>
                        <div className="w-full md:w-1/2 px-3">
                            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-last-name" type="text" placeholder="Last" />
                        </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-email" type="email" placeholder="Email" />
                        </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-phone" type="tel" placeholder="Phone" />
                        </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-password" type="password" placeholder="******************" />
                            <p className="text-gray-600 text-base italic">Make it as long and as crazy as you'd like</p>
                        </div>
                    </div>
                    <div className='flex flex-col space-between mt-10'>
                        <div className="flex items-start mt-12">
                            <input
                                type="checkbox"
                                id="terms"
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="terms" className="ml-2 text-lg text-gray-500">
                                By continuing you accept our <a href="#" className="text-indigo-600 underline">Privacy Policy</a>
                            </label>
                        </div>
                        <button
                            onClick={handleNextStep}
                            className="w-full py-3 bg-black text-white rounded-md font-semibold mt-4">
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
                            <button className="text-6xl">
                                <FaApple />
                            </button>
                            <button className="text-6xl">
                                <FaFacebook className="text-blue-600" />
                            </button>
                            <button className="text-6xl">
                                <FaGoogle className="text-red-600" />
                            </button>
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
