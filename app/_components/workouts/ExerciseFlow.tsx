import React, { useState, useEffect } from 'react';
import CountdownTimer from '../animations/CountdownTimer';
import ExerciseView from '../workouts/ExerciseView';
import RestView from '../workouts/RestView';
import CompleteView from '../workouts/CompleteView';
import { useTranslation } from 'react-i18next';
import { sendCompleteToBackend, sendProgressToBackend } from '@/app/_services/userService';


interface ExerciseFlowProp {
	exercises: Exercise[];
	onClose: () => void;
	onExerciseComplete: (exerciseId: string) => void;
	workoutType: string;
	userId: string;
	workoutPlanId: string;
}

const ExerciseFlow: React.FC<ExerciseFlowProp> = ({
	exercises,
	onClose,
	onExerciseComplete,
	workoutType,
	userId,
	workoutPlanId,
}) => {
	const { t } = useTranslation('global');
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
	const [currentSet, setCurrentSet] = useState(1);
	const [isRest, setIsRest] = useState(false);
	const [isCountdown, setIsCountdown] = useState(true);
	const [isCompleted, setIsCompleted] = useState(false);
	const [restDuration, setRestDuration] = useState(0);
	const [nextExerciseDetails, setNextExerciseDetails] = useState<Exercise | null>(null);
	const [completeMessage, setCompleteMessage] = useState<string | null>(null);
	const [exercisesProgress, setExercisesProgress] = useState<ExerciseProgressModel[]>([]);
	const [exerciseStartTime, setExerciseStartTime] = useState<number | null>(null);

	const totalExercises = exercises.length;
	const currentExercise = exercises[currentExerciseIndex];
	const totalSets = currentExercise?.sets || 1;
	const defaultRestSeconds = currentExercise?.rest_seconds || 60;

	const updateExerciseProgress = () => {
		const exerciseDuration = Math.floor((Date.now() - exerciseStartTime!) / 1000);
		const repsCompleted = Array(totalSets).fill(currentExercise.reps);

		const exerciseProgress = {
			exercise_id: currentExercise.exercise_id,
			sets_completed: totalSets,
			reps_completed: repsCompleted,
			duration_seconds: exerciseDuration,
			calories_burned: 0,
			is_completed: true,
		};

		setExercisesProgress((prevProgress: ExerciseProgressModel[]) => [...prevProgress, exerciseProgress]);
		setExerciseStartTime(null);

		if (workoutType === 'myPlan') {
			const payload = {
				exercises: [exerciseProgress],
				day_of_week: new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
			};
			sendProgressToBackend(payload, userId, workoutPlanId);
			onExerciseComplete(currentExercise.exercise_id);
		}
	};

	const handleNext = () => {
		if (currentSet < totalSets) {
			if (isRest) {
				setCurrentSet(currentSet + 1);
				setIsRest(false);
			} else {
				setIsRest(true);
				setRestDuration(defaultRestSeconds);
				setNextExerciseDetails(exercises[currentExerciseIndex]);
			}
		} else {
			updateExerciseProgress();

			if (currentExerciseIndex < totalExercises - 1) {
				if (isRest) {
					setCurrentExerciseIndex(currentExerciseIndex + 1);
					setCurrentSet(1);
					setRestDuration(120);
					setNextExerciseDetails(exercises[currentExerciseIndex + 1]);
					setIsRest(false);
				} else {
					setIsRest(true);
					setRestDuration(120);
					setNextExerciseDetails(exercises[currentExerciseIndex + 1]);
				}
			} else {
				setIsCompleted(true);
			}
		}
	};

	const handleBack = () => {
		if (isRest) {
			if (currentSet > 1) {
				setIsRest(false);
			} else if (currentExerciseIndex > 0) {
				setCurrentExerciseIndex(currentExerciseIndex - 1);
				const previousExercise = exercises[currentExerciseIndex - 1];
				setCurrentSet(previousExercise.sets);
				setIsRest(true);
				setRestDuration(120);
				setNextExerciseDetails(currentExercise);
			} else {
				onClose();
			}
		} else {
			if (currentSet > 1) {
				setCurrentSet(currentSet - 1);
				setIsRest(true);
				setRestDuration(defaultRestSeconds);
				setNextExerciseDetails(null);
			} else if (currentExerciseIndex > 0) {
				setCurrentExerciseIndex(currentExerciseIndex - 1);
				const previousExercise = exercises[currentExerciseIndex - 1];
				setCurrentSet(previousExercise.sets);
				setIsRest(true);
				setRestDuration(120);
				setNextExerciseDetails(currentExercise);
			} else {
				onClose();
			}
		}
	};

	useEffect(() => {
		if (!isRest && !isCountdown) {
			setExerciseStartTime(Date.now());
		}
	}, [isRest, isCountdown]);

	useEffect(() => {
		if (isCompleted) {
			if (workoutType === 'myPlan') {
				setCompleteMessage(t('ExerciseFlow.completed'));
				setTimeout(() => {
					setCompleteMessage(null);
					onClose();
				}, 3500);
			} else if (workoutType === 'oneDay') {
				var payload = {
					workout_id: workoutPlanId,
					duration_seconds: 0,
					calories_burned: 0,
					exercises: exercisesProgress,
					sequence_day: '1',
					was_skipped: false
				}
				sendCompleteToBackend(payload, userId);
				setCompleteMessage(t('ExerciseFlow.completed'));
			} else {
				setCompleteMessage(t('ExerciseFlow.completed'));
				setTimeout(() => {
					setCompleteMessage(null);
					onClose();
				}, 2500);
			}
		}
	}, [isCompleted, workoutType, onClose, exercisesProgress, t]);

	if (isCompleted) {
		if (workoutType === 'oneDay') {
			return (
				<CompleteView goToPlan='/workouts' textGoTo={t("workouts.plan.goto")}></CompleteView>
			)
		} else {
			return (
				<>
					{completeMessage && (
						<div className="fixed inset-0 flex items-center justify-center pointer-events-none">
							<div className="bg-green-500 text-white text-lg p-8 rounded-lg shadow-2xl">
								{completeMessage}
							</div>
						</div>
					)}
				</>
			);
		}
	}

	if (isCountdown) {
		return (
			<div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
				<CountdownTimer
					title={t('ExerciseFlow.ready')}
					duration={5}
					size={240}
					strockWidth={16}
					onComplete={() => setIsCountdown(false)}
				/>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
			{isRest ? (
				<RestView
					restDuration={restDuration}
					onNext={handleNext}
					onBack={handleBack}
					nextExercise={nextExerciseDetails!}
				/>
			) : (
				<ExerciseView
					exercise={{
						...currentExercise,
						currentSet,
						totalSets,
					}}
					onNext={handleNext}
					onBack={handleBack}
				/>
			)}
		</div>
	);
};

export default ExerciseFlow;
