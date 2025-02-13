'use client';

import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { FaArrowLeft, FaArrowRight, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface ExerciseViewProp {
	exercise: ExerciseView;
	onNext: () => void;
	onBack: () => void;
}

const ExerciseView: React.FC<ExerciseViewProp> = ({ exercise, onNext, onBack }) => {
	const { t } = useTranslation('global');
	const [isPaused, setIsPaused] = useState(false);
	const [isMuted, setIsMuted] = useState(true);
	const videoRef = useRef<HTMLVideoElement>(null);

	if (!exercise) {
		return null;
	}

	const toggleMute = () => {
		if (videoRef.current) {
			videoRef.current.muted = !isMuted;
			setIsMuted(!isMuted);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center h-full w-full bg-white">
			<div className="relative h-[30%] w-full overflow-hidden">
				<video
					ref={videoRef}
					src={exercise.video_url}
					autoPlay
					loop
					muted={isMuted}
					className="object-cover w-full h-full"
				/>
				<button
					onClick={toggleMute}
					className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-full shadow-lg hover:bg-opacity-75 transition"
				>
					{isMuted ? <FaVolumeMute className="text-xl" /> : <FaVolumeUp className="text-xl" />}
				</button>
			</div>
			<div className="flex flex-col justify-evenly items-center h-[60%] pt-6">
				<div>
					<h2 className="text-center text-5xl font-bold">{exercise.name}</h2>
					<p className="text-center text-lg mt-2">
						Set {exercise.currentSet} {t("workouts.plan.of")} {exercise.totalSets}
					</p>
				</div>
				<CountdownCircleTimer
					isPlaying={!isPaused}
					duration={exercise.duration || 120}
					size={180}
					strokeWidth={16}
					colors={['#34D399', '#10B981', '#059669', '#047857']}
					colorsTime={[7, 5, 2, 0]}
					trailColor="#E6E6E6"
					onComplete={() => {
						onNext();
						return { shouldRepeat: false };
					}}
				>
					{({ remainingTime }) => (
						<span className="text-4xl font-bold text-black">{remainingTime}</span>
					)}
				</CountdownCircleTimer>
				<button
					onClick={() => setIsPaused((prev) => !prev)}
					className={`border border-green-500 w-full py-4 px-6 rounded-full font-semibold transition-all duration-300 ease-in-out ${isPaused
						? 'text-green-500 hover:bg-green-500 hover:text-white'
						: 'text-white bg-green-500 hover:bg-green-400'
						}`}
				>
					{isPaused ? t("workouts.plan.resume") : t("workouts.plan.pause")}
				</button>
			</div>
			<div className="flex flex-row justify-evenly w-full h-[10%] items-center max-w-3xl ">
				<button
					className="w-[40%] flex items-center justify-center bg-green-100 hover:bg-green-200 text-black font-bold px-12 py-4 rounded-full shadow-lg transition duration-300 ease-in-out"
					onClick={onBack}
				>
					<FaArrowLeft className="text-xl mr-2" />
					<span className="text-xl">{t("workouts.plan.previous")}</span>
				</button>
				<button
					className="w-[40%] flex items-center justify-center bg-green-100 hover:bg-green-200 text-black font-bold px-12 py-4 rounded-full shadow-lg transition duration-300 ease-in-out"
					onClick={onNext}
				>
					<span className="text-xl">{t("workouts.plan.next")}</span>
					<FaArrowRight className="text-xl ml-2" />
				</button>
			</div>
		</div>
	);
};

export default ExerciseView;
