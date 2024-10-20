'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";
import { IoChevronBack } from "react-icons/io5";
import { FiMail, FiLock } from "react-icons/fi";
import { useSession, signIn } from 'next-auth/react';
import ButtonWithSpinner from '../_components/others/ButtonWithSpinner';
import InputWithIcon from '../_components/form/InputWithIcon';
import { IconType } from 'react-icons';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../_components/others/ProgressSlider';


export default function Login() {
	const { t } = useTranslation('global');
	const [errors, setErrors] = useState<{ [key in keyof FormData]?: string }>({});
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	
	return (
		<div className="flex flex-col h-screen bg-white p-10 items-center">

			<div className='h-[15%] flex flex-col pt-20 w-full lg:max-w-3xl rounded bg-black'>
				<div>
                    <h2>Workout in Progress</h2>
                    <span>14 exercise left</span>
                </div>
                <div>
                    <ProgressBar percentage={50}></ProgressBar>
                </div>
			</div>

			<div className='h-[15%] flex flex-row w-full lg:max-w-3xl'>
			</div>

			<div className='h-[50%] flex w-full items-center justify-center'>
			</div>

			<div className="h-[15%] flex flex-col justify-start text-center">
				
			</div>

			<div className="h-[5%] text-center content-center">
				<p className="text-gray-500">
					{t('LoginPage.dontHaveAcc')} <a href="/register" className="text-indigo-600 underline">{t('LoginPage.signUp')}</a>
				</p>
			</div>
		</div>
	);
}
