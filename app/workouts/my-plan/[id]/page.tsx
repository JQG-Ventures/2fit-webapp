"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaCheckCircle, FaFire } from "react-icons/fa";
import { FiPlayCircle } from "react-icons/fi";
import LoadingScreen from "../../../_components/animations/LoadingScreen";
import Modal from "../../../_components/profile/modal";
import { useSessionContext } from "../../../_providers/SessionProvider";
import ExerciseDetailsModal from "@/app/_components/modals/ExerciseDetailsModal";
import ExerciseFlow from "@/app/_components/workouts/ExerciseFlow";
import Image from "next/image";
import { useApiGet } from "@/app/utils/apiClient";

const daysOfWeekFull = [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday",
];

interface ExerciseCardProps {
	exercise: Exercise;
	onClick: (action: "details" | "start") => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onClick }) => (
	<div
		className={`relative bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105 ${exercise.is_completed ? "opacity-75 pointer-events-none" : ""
			}`}
		onClick={() => onClick("details")}
	>
		<div className="relative w-full h-40">
			<Image
				src={exercise.image_url}
				alt={exercise.name}
				layout="fill"
				objectFit="cover"
			/>
			{exercise.is_completed && (
				<div className="absolute inset-0 bg-black opacity-75"></div>
			)}
			{!exercise.is_completed && (
				<button
					className="absolute inset-0 flex items-center justify-center text-white text-6xl"
					onClick={(e) => {
						e.stopPropagation();
						onClick("start");
					}}
				>
					<FiPlayCircle />
				</button>
			)}
			{exercise.is_completed && (
				<div className="absolute top-2 left-2 text-green-500 text-2xl">
					<FaCheckCircle />
				</div>
			)}
		</div>
		<div className="p-3">
			<h3 className="text-md font-semibold">{exercise.name}</h3>
			<p className="text-base font-light flex items-center">
				<FaFire className="text-green-500 mr-1" />
				{exercise.sets} sets x {exercise.reps} reps
			</p>
		</div>
	</div>
);

interface DaysOfWeekSelectorProps {
	daysOfWeekLetters: string[];
	selectedDayIndex: number;
	setSelectedDayIndex: (index: number) => void;
}

const DaysOfWeekSelector: React.FC<DaysOfWeekSelectorProps> = ({
	daysOfWeekLetters,
	selectedDayIndex,
	setSelectedDayIndex,
}) => (
	<div className="flex flex-row justify-between p-6">
		{daysOfWeekLetters.map((dayLetter, index) => (
			<button
				key={index}
				className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedDayIndex === index
					? "bg-green-500 text-white"
					: "text-gray-700"
					}`}
				onClick={() => setSelectedDayIndex(index)}
			>
				{dayLetter}
			</button>
		))}
	</div>
);

const MyPlan: React.FC = () => {
	const { t } = useTranslation("global");
	const router = useRouter();
	const { userId, loading: sessionLoading } = useSessionContext();
	const { id } = useParams();
	const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
	const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
	const [showExerciseFlow, setShowExerciseFlow] = useState<boolean>(false);
	const [weeklyProgressState, setWeeklyProgressState] = useState<any>(null);
	const getProgressUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/weekly-progress`;
	const { data: weeklyProgressData, isLoading: loadingWeeklyProgress, isError: errorWeeklyProgress } = useApiGet<{ status: string; message: any }>([], getProgressUrl);

	useEffect(() => {
		const currentDayIndex = new Date().getDay() - 1;
		setSelectedDayIndex(currentDayIndex < 0 ? 6 : currentDayIndex); // Sunday as the last index (6)
	}, []);

	useEffect(() => {
		if (weeklyProgressData) {
			const normalizedDays = weeklyProgressData.message.days.map((day: any) => ({
				...day,
				exercises: normalizeExercises(day.exercises),
			}));
			setWeeklyProgressState({ ...weeklyProgressData.message, days: normalizedDays });
		}
	}, [weeklyProgressData]);

	if (sessionLoading || loadingWeeklyProgress) {
		return <LoadingScreen />;
	}

	if (errorWeeklyProgress) {
		return (
			<Modal
				title="Error"
				message={errorWeeklyProgress}
				onClose={() => router.push("/workouts")}
			/>
		);
	}

	const daysOfWeekLetters = ["M", "T", "W", "Th", "F", "Sa", "Su"];
	const daysData: {
		[key: string]: { day_of_week: string; exercises: Exercise[] };
	} = {};

	daysOfWeekFull.forEach((dayName) => {
		daysData[dayName] = {
			day_of_week: dayName,
			exercises: [],
		};
	});
	if (weeklyProgressState) {
		weeklyProgressState.days.forEach(
			(day: { day_of_week: string; exercises: Exercise[] }) => {
				daysData[day.day_of_week.toLowerCase()] = day;
			}
		);
	}

	const normalizeExercises = (exercises: Exercise[]): Exercise[] => {
		const uniqueExercises: { [key: string]: Exercise } = {};
		exercises.forEach((exercise) => {
			uniqueExercises[exercise.exercise_id] = exercise;
		});
		return Object.values(uniqueExercises);
	};	

	const handleExerciseCardClick = (
		exercise: Exercise,
		action: "details" | "start"
	) => {
		if (action === "start") {
			setSelectedExercise(exercise);
			setShowExerciseFlow(true);
		} else {
			setSelectedExercise(exercise);
		}
	};

	const selectedDayName = daysOfWeekFull[selectedDayIndex];
	const selectedDay = daysData[selectedDayName];

	const handleExerciseStart = (exercise: Exercise) => {
		setSelectedExercise(exercise);
		setShowExerciseFlow(true);
	};

	const handleExerciseComplete = (exerciseId: string) => {
		setWeeklyProgressState((prevState: any) => {
			if (!prevState) return prevState;
	
			return {
				...prevState,
				days: prevState.days.map((day: any) => ({
					...day,
					exercises: normalizeExercises(
						day.exercises.map((exercise: Exercise) => {
							if (exercise.exercise_id === exerciseId && !exercise.is_completed) {
								return { ...exercise, is_completed: true };
							}
							return exercise;
						})
					),
				})),
			};
		});
	};

	return (
		<div className="flex flex-col h-screen bg-white p-10 items-center lg:pt-[10vh]">
			<div className="h-[10%] flex flex-row items-center w-full lg:max-w-3xl">
				<button onClick={() => router.back()} className="text-gray-700 mr-4">
					<FaArrowLeft className="w-8 h-8" />
				</button>
				<h1 className="text-5xl font-semibold pl-4">{t('workouts.my-plan.title')}</h1>
			</div>
			<div className="w-full h-[80%] pt-10 lg:max-w-3xl">
				<DaysOfWeekSelector
					daysOfWeekLetters={daysOfWeekLetters}
					selectedDayIndex={selectedDayIndex}
					setSelectedDayIndex={setSelectedDayIndex}
				/>
				{selectedDay && selectedDay.exercises.length > 0 ? (
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
						{selectedDay.exercises.map((exercise) => (
							<ExerciseCard
								key={exercise.exercise_id}
								exercise={exercise}
								onClick={(action) => handleExerciseCardClick(exercise, action)}
							/>
						))}
					</div>
				) : (
					<div className="h-full flex justify-center items-center">
						<p className="text-center text-gray-500">{t('workouts.my-plan.noExercises')}</p>
					</div>
				)}
			</div>
			{selectedExercise && !showExerciseFlow && (
				<ExerciseDetailsModal
					exercise={selectedExercise}
					onClose={() => setSelectedExercise(null)}
					onStartExercise={() => handleExerciseStart(selectedExercise)}
				/>
			)}
			{showExerciseFlow && selectedExercise && (
				<ExerciseFlow
					exercises={[selectedExercise]}
					onClose={() => {
						setShowExerciseFlow(false);
						setSelectedExercise(null);
					}}
					onExerciseComplete={handleExerciseComplete}
					workoutType="myPlan"
					userId={userId!}
					workoutPlanId={id}
				/>
			)}
		</div>
	);
}

export default React.memo(MyPlan);