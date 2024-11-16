'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import WorkoutHeader from '@/app/_components/workouts/WorkoutHeader';
import WorkoutDetails from '@/app/_components/workouts/WorkoutDetails';
import WorkoutFooter from '@/app/_components/workouts/WorkoutFooterStart';
import ExerciseList from '@/app/_components/workouts/ExerciseList';
import LoadingScreen from '@/app/_components/animations/LoadingScreen';
import SavedMessage from '@/app/_components/others/SavedMessage';
import { useTranslation } from 'react-i18next';
import { useFetch } from '@/app/_hooks/useFetch';
import { saveWorkout } from '@/app/_services/workoutService';
import ExerciseFlow from '@/app/_components/workouts/ExerciseFlow';
import { useSessionContext } from '@/app/_providers/SessionProvider';


const WorkoutPlanPage: React.FC = () => {
	const router = useRouter();
	const { id } = useParams();
	const { t } = useTranslation('global');
	const { userId, token, loading: sessionLoading } = useSessionContext();
	const [savedMessage, setSavedMessage] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [showExerciseFlow, setShowExerciseFlow] = useState<boolean>(false);

	const options = useMemo(() => ({ method: 'GET' }), []);
	const { data: workoutPlan, loading, error } = useFetch(
		id ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/plans/${id}` : '',
		options
	);

	const handleSaveClick = useCallback(async (planId: string) => {
		if (!userId) {
			setSavedMessage(t('workouts.plan.userNotLoggedIn'));
			setTimeout(() => setSavedMessage(null), 2000);
			return;
		}

		try {
			const result = await saveWorkout(userId, planId, token!);

			if (result.status === 400) {
				setSavedMessage(t('workouts.plan.workoutAlreadySaved'));
			} else if (result.status === 200) {
				setSavedMessage(t('workouts.plan.workoutSaved'));
			} else {
				setSavedMessage(t('workouts.plan.savingError'));
			}
		} catch (error) {
			console.error('Error saving workout:', error);
			setSavedMessage(t('workouts.plan.savingError'));
		}

		setTimeout(() => setSavedMessage(null), 2000);
	}, [t, userId]);

	const handleStartWorkout = useCallback(() => {
		setIsSubmitting(true);
		setShowExerciseFlow(true);
	}, []);

	const handleExerciseFlowClose = useCallback(() => {
		setShowExerciseFlow(false);
		setIsSubmitting(false);
	}, []);

	if (loading || sessionLoading) return <LoadingScreen />;

	if (error) {
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-center text-red-500">{t('workouts.plan.errorLoading')}</p>
			</div>
		);
	}

	return (
		<div className="bg-gray-50 w-full min-h-screen">
			{showExerciseFlow && workoutPlan ? (
				<ExerciseFlow
					exercises={workoutPlan.workout_schedule[0]?.exercises || []}
					onClose={handleExerciseFlowClose}
					onExerciseComplete={() => { }}
					workoutType="oneDay"
					userId={userId!}
					workoutPlanId={id!}
				/>
			) : (
				<>
					<div className="flex flex-col justify-center">
						<WorkoutHeader
							onSaveClick={() => handleSaveClick(id!)}
							onBackClick={() => router.back()}
							imageUrl={workoutPlan.image_url}
						/>
						<WorkoutDetails workoutPlan={workoutPlan} />
					</div>

					<ExerciseList
						exercises={workoutPlan.workout_schedule[0]?.exercises || []}
						isMobile={true}
					/>

					<WorkoutFooter onStartClick={handleStartWorkout} isSubmitting={isSubmitting} />
					{savedMessage && <SavedMessage message={savedMessage} />}
				</>
			)}
		</div>
	);
};

export default React.memo(WorkoutPlanPage);