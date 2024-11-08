'use client';

import { useEffect, useState } from 'react';
import { IoChevronBack } from 'react-icons/io5';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';


interface RestViewProp {
	restDuration: number;
	onNext: () => void;
	onBack: () => void;
	nextExercise: Exercise
}


const RestView: React.FC<RestViewProp> = ({ restDuration, onNext, onBack, nextExercise }) => {
	const { t } = useTranslation('global');
	const [remainingTime, setRemainingTime] = useState(restDuration);

	useEffect(() => {
		setRemainingTime(restDuration);
	}, [restDuration]);

	useEffect(() => {
		if (remainingTime > 0) {
			const timerId = setInterval(() => {
				setRemainingTime((prev) => prev - 1);
			}, 1000);
			return () => clearInterval(timerId);
		} else {
			onNext();
		}
	}, [remainingTime, onNext]);

	const formatTime = (time: any) => {
		const minutes = Math.floor(time / 60);
		const seconds = time % 60;
		return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	};

	return (
		<div className="flex flex-col h-full p-10 w-full max-w-4xl items-center">
			<div className="h-[15%] w-full pt-20">
				<button onClick={onBack} className="text-4xl lg:hidden">
					<IoChevronBack />
				</button>
			</div>
			<div className="h-[15%] flex flex-col justify-evenly">
				<h2 className="text-center text-5xl font-semibold bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
					{t("RestView.rest")}
				</h2>
				<h2 className="text-center text-5xl font-semibold">{formatTime(remainingTime)}</h2>
			</div>
			<div className="w-full border-t border-gray-300 mx-auto my-10"></div>
			<div className="h-[60%] w-full flex flex-col items-center justify-evenly">
				{nextExercise && (
					<>
						<div className="text-left w-full">
							<h3 className="text-2xl">{t("RestView.nextEx")}</h3>
							<p className="text-3xl font-semibold my-8">{nextExercise.name}</p>
						</div>
						<div className="relative h-[70%] w-full overflow-hidden">
							<Image
								src={nextExercise.image_url}
								alt={nextExercise.name}
								layout="fill"
								objectFit="cover"
								className="mt-2 rounded-lg w-full max-w-lg object-contain"
							/>
						</div>
					</>
				)}
			</div>
			<div className="flex justify-center items-center w-full h-[10%]">
				<button
					onClick={onNext}
					className="bg-gradient-to-r from-emerald-400 to-emerald-600 w-full text-white py-6 rounded-full text-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
				>
					{t("RestView.skip")}
				</button>
			</div>
		</div>
	);
};

export default RestView;
