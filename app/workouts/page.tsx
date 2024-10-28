'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaApple, FaArrowLeft, FaFacebook, FaGoogle } from "react-icons/fa";
import { IoChevronBack } from "react-icons/io5";
import { FiMail, FiLock } from "react-icons/fi";
import { useSession, signIn } from 'next-auth/react';
import ButtonWithSpinner from '../_components/others/ButtonWithSpinner';
import InputWithIcon from '../_components/form/InputWithIcon';
import { IconType } from 'react-icons';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../_components/others/ProgressSlider';
import PopularExercisesSection from '../_components/_sections/PopularWorkoutsSection';


export default function Login() {
	const { t } = useTranslation('global');
	const [errors, setErrors] = useState<{ [key in keyof FormData]?: string }>({});
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [isClicked, setIsClicked] = useState(false);

	const handleClick = () => {
		if (isClicked) return; // Prevent multiple clicks
		setIsClicked(true);
		setTimeout(() => {
			router.push('/workouts/my-plan');
		}, 300);
	};

	const workouts = [
		{ title: "Testing 1", workoutCount: 20, image: "https://2fitcontentstorage.blob.core.windows.net/2fit-content/pilates.jpg" },
		{ title: "Testing 2", workoutCount: 13, image: "https://2fitcontentstorage.blob.core.windows.net/2fit-content/pilates.jpg" },
		{ title: "Testing 3", workoutCount: 18, image: "https://2fitcontentstorage.blob.core.windows.net/2fit-content/pilates.jpg" }
	]

	return (
		<div className="flex flex-col h-screen bg-white p-10 items-center">
			<div className="h-[10%] flex flex-row justify-left space-x-8 items-center w-full lg:max-w-3xl">
				<button onClick={() => router.back()} className="text-gray-700">
					<FaArrowLeft className="w-8 h-8" />
				</button>
			</div>
			<div
				className={`cursor-pointer h-[13%] flex flex-row justify-center items-center w-full lg:max-w-3xl rounded-3xl bg-black p-10 ${isClicked ? 'animate-click' : ''
					} hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
				onClick={handleClick}
			>
				<div className='w-1/2 flex flex-col justify-evenly align-start pr-4'>
					<h2 className='text-white text-3xl font-semibold'>Workout Progress</h2>
					<span className='text-gray-200 text-2xl'>14 exercise left</span>
				</div>
				<div className='w-1/2 flex flex-col  justify-center align-center text-white'>
					<ProgressBar percentage={68}></ProgressBar>
				</div>
			</div>

			<div className='flex flex-row w-full lg:max-w-3xl'>
				<PopularExercisesSection workouts={workouts}></PopularExercisesSection>
			</div>
		</div>
	);
}
