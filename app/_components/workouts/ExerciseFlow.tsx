import React, { useState, useEffect } from 'react';
import CountdownTimer from '../animations/CountdownTimer';
import ExerciseView from '../workouts/ExerciseView';
import RestView from '../workouts/RestView';
import CompleteView from '../workouts/CompleteView';
import { useTranslation } from 'react-i18next';


interface ExerciseFlowProp {
	exercises: Exercise[];
	onClose: () => void;
	workoutType: string;
}

const ExerciseFlow: React.FC<ExerciseFlowProp> = ({ exercises, onClose, workoutType }) => {
	const { t } = useTranslation('global');
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
	const [currentSet, setCurrentSet] = useState(1);
	const [isRest, setIsRest] = useState(false);
	const [isCountdown, setIsCountdown] = useState(true);
	const [isCompleted, setIsCompleted] = useState(false);
	const [restDuration, setRestDuration] = useState(0);
	const [nextExerciseDetails, setNextExerciseDetails] = useState<Exercise | null>(null);
	const [completeMessage, setCompleteMessage] = useState<string | null>(null);

	const totalExercises = exercises.length;
	const currentExercise = exercises[currentExerciseIndex];
	const totalSets = currentExercise?.sets || 1;
	const defaultRestSeconds = currentExercise?.rest_seconds || 60;

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
		if (isCompleted && workoutType === 'myPlan') {
			setCompleteMessage(t("ExerciseFlow.completed"));
			setTimeout(() => {
				setCompleteMessage(null);
				onClose();
			}, 3500);
		}
	}, [t, isCompleted, workoutType, onClose]);

	if (isCompleted) {
		if (workoutType === 'myPlan') {
			return (
				<>
					{completeMessage && 
					<div className="fixed inset-0 flex items-center justify-center pointer-events-none">
            			<div className="bg-green-500 text-white text-lg p-8 rounded-lg shadow-2xl">
                			{completeMessage}
            			</div>
			        </div>}
				</>
			);
		} else {
			return (
				<div className="fixed inset-0 flex items-center justify-center bg-white z-50">
					<CompleteView goToPlan="/workouts" />
				</div>
			);
		}
	}

	if (isCountdown) {
		return (
			<div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
				<CountdownTimer
					title={t("ExerciseFlow.ready")}
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
