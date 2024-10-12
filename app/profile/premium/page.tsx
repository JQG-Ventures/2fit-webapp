'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';

const Premium: React.FC = () => {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const router = useRouter();

    return (
        <div className='flex items-center justify-center bg-gray-50 h-screen px-6'>
            <div
                className="absolute inset-0 bg-cover bg-center opacity-70"
                style={{ backgroundImage: "url('/images/onboarding-3.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" style={{ height: '100%' }} />

            <div className="relative lg:max-w-2xl pt-10">

                <div className='w-full h-[30%] lg:max-w-6xl lg:mb-0 pt-10 md:pt-24'>
                    <h6 className="text-6xl md:text-6xl font-semibold mb-4 text-green-500 text-left pb-4">Be Premium</h6>
                    <h2 className="text-6xl md:text-6xl font-semibold mb-4 text-green-500 text-left pb-4">Get Unlimited Access</h2>
                    <p className="text-4xl md:text-4xl font-semibold mb-8 text-left">Enjoy workout access without ads and restrictions.</p>
                </div>

                <div className="flex flex-col w-full h-[40%] lg:max-w-6xl lg:mb-0">
                    <div
                        className={`border-2 ${selectedPlan === '1' ? 'border-green-700 bg-green-300/50' : 'border-white bg-white'} rounded-[25px] p-5 mb-8 shadow-lg w-full py-10 flex items-center`}
                    >
                        <input
                            type="radio"
                            name="subscription"
                            id="plan1"
                            className="hidden peer"
                            onChange={() => setSelectedPlan('1')}
                        />
                        <label htmlFor="plan1" className="flex items-center cursor-pointer w-full">
                            <span className="w-6 h-6 inline-flex items-center justify-center rounded-full border-2 border-green-700 mr-4 peer-checked:bg-green-500 peer-checked:border-transparent">
                                <span className={`w-3 h-3 rounded-full transition-opacity duration-200 ${selectedPlan === '1' ? 'bg-green-700 opacity-100' : 'bg-white opacity-0'}`}></span>
                            </span>
                            <div className="flex flex-col w-full">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold text-3xl">1 Month</h2>
                                    <h2 className="font-semibold text-3xl ml-auto">$16.99/m</h2>
                                </div>
                                <p className="text-xl mt-2 text-gray-600">Pay once, cancel any time.</p>
                            </div>
                        </label>
                    </div>

                    <div
                        className={`border-2 ${selectedPlan === '2' ? 'border-green-700 bg-green-300/50' : 'border-white bg-white'} rounded-[25px] p-5 mb-8 shadow-lg w-full py-10 flex items-center`}
                    >
                        <input
                            type="radio"
                            name="subscription"
                            id="plan2"
                            className="hidden peer"
                            onChange={() => setSelectedPlan('2')}
                        />
                        <label htmlFor="plan2" className="flex items-center cursor-pointer w-full">
                            <span className="w-6 h-6 inline-flex items-center justify-center rounded-full border-2 border-green-700 mr-4 peer-checked:bg-green-300 peer-checked:border-transparent">
                                <span className={`w-3 h-3 rounded-full transition-opacity duration-200 ${selectedPlan === '2' ? 'bg-green-700 opacity-100' : 'bg-white opacity-0'}`}></span>
                            </span>
                            <div className="flex flex-col w-full">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold text-3xl">6 Months</h2>
                                    <h2 className="font-semibold text-3xl ml-auto">$66.99/m</h2>
                                </div>
                                <p className="text-xl mt-2 text-gray-600">Pay once, cancel any time.</p>
                            </div>
                        </label>
                    </div>

                    <div
                        className={`border-2 ${selectedPlan === '3' ? 'border-green-700 bg-green-300/50' : 'border-white bg-white'} rounded-[25px] p-5 mb-8 shadow-lg w-full py-10 flex items-center`}
                    >
                        <input
                            type="radio"
                            name="subscription"
                            id="plan3"
                            className="hidden peer"
                            onChange={() => setSelectedPlan('3')}
                        />
                        <label htmlFor="plan3" className="flex items-center cursor-pointer w-full">
                            <span className="w-6 h-6 inline-flex items-center justify-center rounded-full border-2 border-green-700 mr-4 peer-checked:bg-green-300 peer-checked:border-transparent">
                                <span className={`w-3 h-3 rounded-full transition-opacity duration-200 ${selectedPlan === '3' ? 'bg-green-700 opacity-100' : 'bg-white opacity-0'}`}></span>
                            </span>
                            <div className="flex flex-col w-full">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold text-3xl">12 Months</h2>
                                    <h2 className="font-semibold text-3xl ml-auto">$116.99/m</h2>
                                </div>
                                <p className="text-xl mt-2 text-gray-600">Pay once, cancel any time.</p>
                            </div>
                        </label>
                    </div>
                </div>

                <div className='w-full h-[30%] lg:max-w-6xl lg:mb-0'>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-400 to-green-700 text-white p-2 rounded-full text-3xl md:text-3xl font-semibold shadow-lg py-4 transition-transform"
                    >
                        Subscribe
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Premium;
