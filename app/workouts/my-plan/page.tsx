'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft } from 'react-icons/fa';


export default function Login() {
	const { t } = useTranslation('global');
	const router = useRouter();

	return (
		<div className="flex flex-col h-screen bg-white p-10 items-center">
			<div className="h-[10%] flex flex-row justify-left space-x-8 items-center w-full lg:max-w-3xl">
				<button onClick={() => router.back()} className="text-gray-700">
					<FaArrowLeft className="w-8 h-8" />
				</button>
				<h1 className="text-5xl font-semibold">My Workout Plan</h1>
			</div>
		</div>
	);
}
