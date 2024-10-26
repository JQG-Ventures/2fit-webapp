'use client';

import React, { useState, useEffect } from 'react';
import ButtonWithSpinner from '../others/ButtonWithSpinner';
import { IoIosCloseCircle } from 'react-icons/io';

const Premium = ({ onClose }) => {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const updateScreenSize = () => setIsDesktop(window.innerWidth >= 1024);
        updateScreenSize();
        window.addEventListener('resize', updateScreenSize);
        return () => window.removeEventListener('resize', updateScreenSize);
    }, []);

    const handleSubscribe = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center ${
                isDesktop ? 'bg-black bg-opacity-50' : 'bg-gray-50'
            }`}
        >
            <div
                className={`relative ${
                    isDesktop ? 'bg-white max-w-4xl' : 'w-full h-full'
                } bg-cover bg-center bg-no-repeat rounded-3xl shadow-lg p-10`}
                style={{ backgroundImage: "url('/images/onboarding-3.jpg')" }}
            >
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={onClose}
                >
                    <IoIosCloseCircle className="w-12 h-12 md:w-9 md:h-9" />
                </button>

                <div
                    className={`relative z-10 ${
                        isDesktop ? 'bg-white/80 rounded-3xl p-6' : 'p-6 h-full flex flex-col justify-end md:justify-start'
                    }`}
                >
                    <div className="relative w-full max-w-5xl flex flex-col items-start justify-center space-y-10">
                        <div className={`${isDesktop ? 'md:pb-6' : 'pb-16'}`}>
                            <div className="flex flex-col items-start space-y-5 pb-10 md:pb-6 md:pt-0">
                                <h6 className="text-7xl font-semibold text-green-600">Be Premium</h6>
                                <h2 className="text-6xl font-semibold text-green-500">Get Unlimited Access</h2>
                                <p className="text-3xl text-gray-700">Enjoy workout access without ads and restrictions.</p>
                            </div>

                            <div className="w-full space-y-5 mt-6 md:mt-2">
                                {['1', '2', '3'].map((plan) => (
                                    <div
                                        key={plan}
                                        className={`border-2 ${
                                            selectedPlan === plan ? 'border-green-700 bg-green-300/20' : 'border-gray-200 bg-white'
                                        } rounded-2xl p-8 flex items-center cursor-pointer transition-all duration-300 shadow-md`}
                                        onClick={() => setSelectedPlan(plan)}
                                    >
                                        <input
                                            type="radio"
                                            name="subscription"
                                            id={`plan${plan}`}
                                            className="hidden peer"
                                            checked={selectedPlan === plan}
                                            readOnly
                                        />
                                        <label htmlFor={`plan${plan}`} className="flex items-center w-full cursor-pointer">
                                            <span className="w-8 h-8 inline-flex items-center justify-center rounded-full border-2 border-green-700 mr-4">
                                                <span
                                                    className={`w-4 h-4 rounded-full transition-opacity duration-200 ${
                                                        selectedPlan === plan ? 'bg-green-700 opacity-100' : 'opacity-0'
                                                    }`}
                                                ></span>
                                            </span>
                                            <div className="flex flex-col w-full">
                                                <div className="flex items-center justify-between">
                                                    <h2 className="font-semibold text-3xl">
                                                        {plan === '1' ? '1 Month' : plan === '2' ? '6 Months' : '12 Months'}
                                                    </h2>
                                                    <h2 className="font-semibold text-3xl text-gray-800">
                                                        ${plan === '1' ? '16.99' : plan === '2' ? '66.99' : '116.99'}/m
                                                    </h2>
                                                </div>
                                                <p className="text-xl text-gray-600">Pay once, cancel any time.</p>
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div className="w-full mt-10 md:mt-6">
                                <ButtonWithSpinner
                                    onClick={handleSubscribe}
                                    loading={loading}
                                    className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full text-3xl font-semibold shadow-lg transition-transform hover:scale-105 shadow-green-500/50 py-6"
                                >
                                    Subscribe
                                </ButtonWithSpinner>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Premium;