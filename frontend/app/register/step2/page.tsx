'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IoChevronBack } from "react-icons/io5";
import { useRegister } from '../../_components/register/RegisterProvider';
import { verifyCode } from '../../_services/registerService';

export default function RegisterStep2() {
    const router = useRouter();

    // Temporary while the app is deployed
    useEffect(() => {
        router.push('/register/step3');
    }, [router]);

    return null;

    // const { data } = useRegister();
    // const [code, setCode] = useState(["", "", "", ""]);
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState('');
    // const [animateOut, setAnimateOut] = useState(false);
    // const phoneNumber = data.number || "Unknown";

    // const handleChange = (index: any, value: any) => {
    //     if (/^\d*$/.test(value)) {
    //         const newCode = [...code];
    //         newCode[index] = value;
    //         setCode(newCode);
    //         if (value && index < 3) {
    //             document.getElementById(`digit-${index + 1}`)?.focus();
    //         }
    //     }
    // };

    // const handlePrevStep = () => {
    //     router.push('/register/step1');
    // };

    // const handleNextStep = async () => {
    //     setLoading(true);
    //     setError('');

    //     await new Promise(resolve => setTimeout(resolve, 2000));
    //     const response_code = await verifyCode(data.number, code.join(''))
    //     const isValid = response_code === 200;

    //     setLoading(false);

    //     if (isValid) {
    //         setAnimateOut(true);
    //         setTimeout(() => {
    //             router.push('/register/step3');
    //         }, 500);
    //     } else {
    //         if (response_code == 400) {
    //             setError('The code entered is not valid. Please try again.');
    //         } else {
    //             setError('There was a problem verifing the code. Please try again.');
    //         }
    //     }
    // };

    // return (
    //     <div className="flex flex-col h-screen bg-white p-10 items-center">
    //         <div className='h-[15%] pt-20 w-full lg:max-w-3xl'>
    //             <button onClick={handlePrevStep} className="text-4xl lg:hidden">
    //                 <IoChevronBack />
    //             </button>
    //         </div>

    //         <div className='h-[25%] flex flex-row w-full lg:max-w-3xl'>
    //             <button onClick={handlePrevStep} className="hidden text-4xl lg:flex mr-14 mt-5 text-center">
    //                 <IoChevronBack />
    //             </button>
    //             <h1 className='text-6xl font-semibold'>Verify your <br />Number</h1>
    //         </div>

    //         <div className='h-[40%] flex flex-col w-full items-center justify-center'>
    //             <p className="text-gray-600 text-center mb-6">
    //                 We sent a code to your number <br /><span className="font-semibold">{phoneNumber}</span> <a href="step1" className="text-blue-500">Change</a>
    //             </p>
    //             <div className="flex justify-center my-28">
    //                 {code.map((digit, index) => (
    //                     <input
    //                         key={index}
    //                         id={`digit-${index}`}
    //                         type="text"
    //                         maxLength={1}
    //                         value={digit}
    //                         onChange={(e) => handleChange(index, e.target.value)}
    //                         className="w-20 h-20 mx-4 text-center text-3xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    //                     />
    //                 ))}
    //             </div>
    //             {error && <p className="text-red-500 text-center">{error}</p>}
    //             <p className="text-center text-gray-500">
    //                 Don't receive your code? <a href="#" className="text-blue-500">Resend</a>
    //             </p>
    //         </div>
    //         <div className="h-[20%] w-48 flex items-center justify-center">
    //             <button
    //                 onClick={handleNextStep}
    //                 className="w-full max-w-xs sm:max-w-md py-3 bg-black text-white rounded-md font-semibold mt-4 flex justify-center items-center"
    //                 disabled={loading}
    //             >
    //                 {loading ? (
    //                     <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    //                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    //                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
    //                     </svg>
    //                 ) : (
    //                     'Next'
    //                 )}
    //             </button>
    //         </div>

    //     </div>
    // );
}
