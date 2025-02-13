"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FaArrowLeft } from "react-icons/fa";
import LoadingScreen from "../../../_components/animations/LoadingScreen";
import Modal from "../../../_components/profile/modal";
import ExerciseDetailsModal from "@/app/_components/modals/ExerciseDetailsModal";
import ExerciseFlow from "@/app/_components/workouts/ExerciseFlow";
import { useApiGet } from "@/app/utils/apiClient";
import { useSession } from "next-auth/react";
import { HiDotsHorizontal } from "react-icons/hi";
import ConfirmationModal from "@/app/_components/modals/confirmationModal";
import { useDeleteExercises, useModifyExercises } from "@/app/_services/workoutService";
import ExerciseCard from "@/app/_components/workouts/my-plan/ExerciseCard";
import DaysOfWeekSelector from "@/app/_components/workouts/my-plan/DaysOfWeekSelector";
import ViewModal from "@/app/_components/modals/ViewModal";
import CustomModal from "@/app/_components/modals/CustomModal";
import ExerciseList from "@/app/_components/workouts/ExerciseList";
import { getSimilarExercises } from "@/app/_services/exerciseService";


const daysOfWeekFull = [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday",
];

const MyPlan: React.FC = () => {
	const { id } = useParams();
	const router = useRouter();
	const { t } = useTranslation("global");
	const { data: session, status } = useSession();

	const sessionLoading = status === 'loading';
	const userId = session?.user?.id;
	// @ts-ignore
	const token = session?.user?.token;


	const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
	const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
	const [showExerciseFlow, setShowExerciseFlow] = useState<boolean>(false);

	const [showOptionsModal, setShowOptionsModal] = useState<boolean>(false);
	const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
	const [isOptionalExercisesOpen, setIsOptionalExercisesOpen] = useState(false);

	const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
	const [isOptionalMode, setIsOptionalMode] = useState<boolean>(false);

	const [exercisesToDelete, setExercisesToDelete] = useState<{ [key: string]: string[] }>({});
	const [weeklyProgressState, setWeeklyProgressState] = useState<any>(null);
	const [similarExercises, setSimilarExercises] = useState([]);

	const getProgressUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/weekly-progress`;
	const { data: weeklyProgressData, isLoading: loadingWeeklyProgress, isError: errorWeeklyProgress, refetch: refetchWeeklyProgress } = useApiGet<{ status: string; message: any }>([], getProgressUrl);
	const { mutate: deleteExercises } = useDeleteExercises(id.toString());
	const { mutate: modifyExercises } = useModifyExercises(id.toString());

	const [selectedExerciseForReplacement, setSelectedExerciseForReplacement] = useState<string>('');
	const [showExerciseReplaceConfirm, setShowExerciseReplaceConfirm] = useState(false);
	const [exerciseToReplaceId, setExerciseToReplaceId] = useState<string>('');
	const [exercisesToReplace, setExercisesToReplace] = useState<{ [key: string]: { old_exercise_id: string; new_exercise: string }[] }>({});


	useEffect(() => {
		const currentDayIndex = new Date().getDay() - 1;
		setSelectedDayIndex(currentDayIndex < 0 ? 6 : currentDayIndex);
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
			uniqueExercises[exercise.exercise_id!] = exercise;
		});
		return Object.values(uniqueExercises);
	};

	const handleDeleteMode = () => {
		setIsDeleteMode(true);
		setShowOptionsModal(false);
	};

	const handleOptionalMode = () => {
		setIsOptionalMode(true);
		setShowOptionsModal(false);
	};

	const handleDeleteSelect = (exerciseId: string) => {
		setExercisesToDelete((prev) => {
			const updated = { ...prev };
			const day = daysOfWeekFull[selectedDayIndex];

			if (!updated[day]) {
				updated[day] = [];
			}

			if (updated[day].includes(exerciseId)) {
				updated[day] = updated[day].filter(id => id !== exerciseId);
			} else {
				updated[day] = [...updated[day], exerciseId];
			}

			if (updated[day].length === 0) {
				delete updated[day];
			}

			return { ...updated };
		});
	};

	const handleOptionalSelect = async (exercise_id: string) => {
		setExerciseToReplaceId(exercise_id);
		const similarExercises = await getSimilarExercises(exercise_id, token);
		setSimilarExercises(similarExercises);
		setIsOptionalExercisesOpen(true);
	};

	const handleConfirmDelete = () => {
		deleteExercises(
			exercisesToDelete,
			{
				onSuccess: (response) => {
					setIsDeleteMode(false);
					setExercisesToDelete({});
					setShowConfirmationModal(false);
					refetchWeeklyProgress();
				},
				onError: (error) => console.error('Error ddeleting exercises:', error.message),
			}
		);
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
	const selectedDay = weeklyProgressState?.days.find((day: any) => day.day_of_week.toLowerCase() === selectedDayName);


	const handleExerciseStart = (exercise: Exercise) => {
		setSelectedExercise(exercise);
		setShowExerciseFlow(true);
	};

	const handleExerciseSelection = (selectedExercise: Exercise) => {
		const day = daysOfWeekFull[selectedDayIndex];

		setExercisesToReplace((prev) => ({
			...prev,
			[day]: [
				...(prev[day] || []),
				{ old_exercise_id: exerciseToReplaceId, new_exercise: selectedExercise._id! },
			],
		}));

		setWeeklyProgressState((prevState: any) => {
			if (!prevState) return prevState;

			return {
				...prevState,
				days: prevState.days.map((dayData: any) => {
					if (dayData.day_of_week.toLowerCase() !== day.toLowerCase()) {
						return dayData;
					}

					return {
						...dayData,
						exercises: dayData.exercises.map((exercise: Exercise) => {
							if (exercise.exercise_id === exerciseToReplaceId) {
								return { ...selectedExercise, exercise_id: exerciseToReplaceId };
							}
							return exercise;
						}),
					};
				}),
			};
		});

		setShowExerciseReplaceConfirm(false);
		setIsOptionalExercisesOpen(false);
		setExerciseToReplaceId('');
	};

	const handleConfirmExerciseReplace = () => {
		deleteExercises(
			exercisesToDelete,
			{
				onSuccess: (response) => {
					setIsDeleteMode(false);
					setExercisesToDelete({});
					setShowConfirmationModal(false);
					refetchWeeklyProgress();
				},
				onError: (error) => console.error('Error ddeleting exercises:', error.message),
			}
		);

		modifyExercises(
			exercisesToReplace,
			{
				onSuccess: () => {
					setIsOptionalMode(false);
					setExercisesToReplace({});
					setShowConfirmationModal(false);
					refetchWeeklyProgress();
				},
				onError: (error) => console.error('Error replacing exercises:', error.message),
			}
		);

		setIsOptionalMode(false);
		setExercisesToReplace({});
		setShowConfirmationModal(false);
		refetchWeeklyProgress();
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
				<button onClick={() => router.back()} className="text-gray-700 mr-4"><FaArrowLeft className="w-8 h-8" /></button>
				<h1 className="text-5xl text-center font-semibold lg:w-full">{t('workouts.my-plan.title')}</h1>
				<button onClick={() => setShowOptionsModal(true)} className="text-gray-700 ml-4"><HiDotsHorizontal className="w-8 h-8" /></button>
			</div>

			<div className="w-full h-[80%] overflow-y-auto pt-10 lg:max-w-3xl">
				<DaysOfWeekSelector
					daysOfWeekLetters={daysOfWeekLetters}
					selectedDayIndex={selectedDayIndex}
					setSelectedDayIndex={setSelectedDayIndex}
				/>
				{selectedDay && selectedDay.exercises.length > 0 ? (
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
						{selectedDay && selectedDay.exercises.map((exercise: Exercise) => (
							<ExerciseCard
								key={exercise.exercise_id}
								exercise={exercise}
								onClick={(action) => handleExerciseCardClick(exercise, action)}
								isDeleteMode={isDeleteMode}
								isOptionalMode={isOptionalMode}
								onDeleteSelect={handleDeleteSelect}
								onOptionalSelect={handleOptionalSelect}
								selectedForDelete={exercisesToDelete[selectedDayName]?.includes(exercise.exercise_id!) || false}
							/>
						))}
					</div>
				) : (
					<div className="h-full flex justify-center items-center">
						<p className="text-center text-gray-500">{t('workouts.my-plan.noExercises')}</p>
					</div>
				)}
			</div>

			<div className={`h-[10%] flex flex-row justify-between items-center w-full max-w-xl ${!isDeleteMode ? 'hidden' : ''}`}>
				<button
					onClick={() => { setShowConfirmationModal(true) }}
					type="submit"
					className="w-[45%] bg-gradient-to-r from-green-400 to-green-700 text-white px-4 rounded-full text-2xl font-semibold shadow-lg py-4 flex items-center justify-center"
				>{t("workouts.my-plan.confirm")}
				</button>
				<button
					onClick={() => {
						setIsDeleteMode(false);
						setExercisesToDelete({});
					}}
					type="submit"
					className="w-[45%] bg-red-500 text-white px-4 rounded-full text-2xl font-semibold shadow-lg py-4 flex items-center justify-center"
				>{t('home.SavedWorkoutsSection.SavedWorkoutsSectioncancelText')}
				</button>
			</div>

			<div className={`h-[10%] flex flex-row justify-between items-center w-full max-w-xl ${!isOptionalMode ? 'hidden' : ''}`}>
				<button
					onClick={() => setShowConfirmationModal(true)}
					type="submit"
					className="w-[45%] bg-gradient-to-r from-green-400 to-green-700 text-white px-4 rounded-full text-2xl font-semibold shadow-lg py-4 flex items-center justify-center"
				>
					{t("workouts.my-plan.confirm")}
				</button>
				<button
					onClick={() => {
						setIsOptionalMode(false);
						setExercisesToReplace({});
					}}
					type="submit"
					className="w-[45%] bg-red-500 text-white px-4 rounded-full text-2xl font-semibold shadow-lg py-4 flex items-center justify-center"
				>
					{t('home.SavedWorkoutsSection.SavedWorkoutsSectioncancelText')}
				</button>
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
					workoutPlanId={id.toString()}
				/>
			)}


			{/* Modal for options e.g. Change Exercise and Delete Exercise */}
			<CustomModal handleCloseModal={() => setShowOptionsModal(false)} isOpen={showOptionsModal}>
				{
					<>
						<h1 className="text-gray-700 text-3xl font-semibold text-center mb-12">{t("workouts.my-plan.exerciseOptions")}</h1>
						<div className="flex flex-col space-y-8">
							<button
								className="bg-gradient-to-r from-green-400 to-green-600 text-white p-3 rounded-full w-full max-w-xs mx-auto"
								onClick={handleOptionalMode}
							>
								{t("workouts.my-plan.changeExercise")}
							</button>
							<button
								className="bg-red-500 text-white p-3 rounded-full w-full max-w-xs mx-auto"
								onClick={handleDeleteMode}
							>
								{t("workouts.my-plan.deleteExercise")}
							</button>
						</div>
					</>
				}
			</CustomModal>

			{/* Modal for confirmation Question */}
			<ConfirmationModal
				isOpen={showConfirmationModal}
				onClose={() => { setShowConfirmationModal(false) }}
				onConfirm={isDeleteMode ? handleConfirmDelete : handleConfirmExerciseReplace}
				question={isDeleteMode ? t('home.SavedWorkoutsSection.SavedWorkoutsSectionquestion') : "Modificar?"}
				confirmText={t('home.SavedWorkoutsSection.SavedWorkoutsSectionconfirmText')}
				cancelText={t('home.SavedWorkoutsSection.SavedWorkoutsSectioncancelText')}
			/>

			<ConfirmationModal
				isOpen={showExerciseReplaceConfirm}
				onClose={() => setShowExerciseReplaceConfirm(false)}
				onConfirm={handleConfirmExerciseReplace}
				question={t("workouts.my-plan.confirmExerciseReplace")}
				confirmText={t("workouts.my-plan.replace")}
				cancelText={t("workouts.my-plan.cancel")}
			/>

			{isOptionalExercisesOpen && (
				<ViewModal isOpen={isOptionalExercisesOpen} onClose={() => setIsOptionalExercisesOpen(false)} title={t("workouts.plan.workoutActivity")}>
					<ExerciseList exercises={similarExercises} isMobile={true} onExerciseSelect={handleExerciseSelection} />
				</ViewModal>
			)}

		</div>
	);
}

export default React.memo(MyPlan);