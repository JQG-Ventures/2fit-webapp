'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';

const Premium: React.FC = () => {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const router = useRouter();

    return (
        <div className="relative min-h-screen bg-white pt-40 md:pt-24">
            {/* Fondo de la imagen */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-70"
                style={{ backgroundImage: "url('/images/onboarding-3.jpg')" }}
            />
            {/* Gradiente ajustado para un difuminado menos pronunciado en la parte superior */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" style={{ height: '100%' }} />

            {/* Contenido */}
            <div className="relative z-10 flex flex-col items-start p-6 pb-40"> {/* Cambiar items-center a items-start */}
                <h6 className="text-6xl font-semibold mb-4 text-green-500 text-lef pb-4">Be Premium</h6>
                <h2 className="text-6xl font-semibold mb-4 text-green-500 text-left pb-4">Get Unlimited Access</h2>
                <p className="text-4xl  font-semibold mb-8 text-left pb-6">Enjoy workout access without ads and restrictions.</p>

                {/* Plan Selection */}
                <div className="flex flex-col w-full"> {/* Elimina max-w-md aquí */}
                    {/* 1 Month Plan */}
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

                    {/* 6 Months Plan */}
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

                    {/* 12 Months Plan */}
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

                {/* Subscribe Button */}
                <div className='pt-8 w-full'>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-400 to-green-700 text-white p-4 rounded-full text-2xl font-semibold shadow-lg py-8 transition-transform"
                    >
                        Subscribe
                    </button>
                </div>

                <form className="space-y-6"></form>
            </div>
        </div>
    );
};

export default Premium;
