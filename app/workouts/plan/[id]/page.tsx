'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import WorkoutHeader from '@/app/_components/workouts/WorkoutHeader';
import WorkoutDetails from '@/app/_components/workouts/WorkoutDetails';
import WorkoutFooter from '@/app/_components/workouts/WorkoutFooterStart';
import ExerciseList from '@/app/_components/workouts/ExerciseList';
import LoadingScreen from '@/app/_components/animations/LoadingScreen';
import SavedMessage from '@/app/_components/others/SavedMessage';
import { useTranslation } from 'react-i18next';
import ExerciseFlow from '@/app/_components/workouts/ExerciseFlow';
import { useSessionContext } from '@/app/_providers/SessionProvider';
import { useApiGet } from '@/app/utils/apiClient';
import { useSaveWorkout } from '@/app/_services/userService';
import { useLoading } from '@/app/_providers/LoadingProvider';


const WorkoutPlanPage: React.FC = () => {
	const router = useRouter();
	const { id } = useParams();
	const { t } = useTranslation('global');
	const { setLoading } = useLoading();
	const { userId } = useSessionContext();
	const [savedMessage, setSavedMessage] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [showExerciseFlow, setShowExerciseFlow] = useState<boolean>(false);
	const { mutate: saveWorkout } = useSaveWorkout();

	const getActivePlansUrl = `/api/workouts/plans/${id}`;
	const { data: workoutPlan, isLoading: loadingPlans, isError: error } =
		useApiGet<{ status: string; message: any }>([], getActivePlansUrl);



	const handleSaveClick = useCallback(async (planId: string) => {
		saveWorkout(
			{ queryParams: { workout_id: planId } },
			{
				onSuccess: (data) => {
					if (data.status === 'success') {
						setSavedMessage(t('workouts.plan.workoutSaved'));
						setTimeout(() => setSavedMessage(null), 3000);
					}
				},
				onError: (error: any) => {
					if (error.response?.status === 400) {
						setSavedMessage(t('workouts.plan.workoutAlreadySaved'));
					} else {
						setSavedMessage(t('workouts.plan.savingError'));
					}
					setTimeout(() => setSavedMessage(null), 3000);
				},
			}
		);
	}, [t, saveWorkout]);

	const handleStartWorkout = useCallback(() => {
		setIsSubmitting(true);
		setShowExerciseFlow(true);
	}, []);

	const handleExerciseFlowClose = useCallback(() => {
		setShowExerciseFlow(false);
		setIsSubmitting(false);
	}, []);

	useEffect(() => {
		if (loadingPlans) {
			setLoading(true);
		} else {
			console.log("JUST HERE", workoutPlan)
			setLoading(false);
		}
	}, [loadingPlans, setLoading])

	if (loadingPlans) {
		return null;
	  }

	if (error) {
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-center text-red-500">{t('workouts.plan.errorLoading')}</p>
			</div>
		);
	}

	return (
		<div className="bg-gray-50 w-full min-h-screen">
			{showExerciseFlow && workoutPlan?.message ? (
				<ExerciseFlow
					exercises={workoutPlan?.message.workout_schedule[0]?.exercises || []}
					onClose={handleExerciseFlowClose}
					onExerciseComplete={() => { }}
					workoutType="oneDay"
					userId={userId!}
					//@ts-ignore
					workoutPlanId={id}
				/>
			) : (
				<>
					<div className="flex flex-col justify-center">
						<WorkoutHeader
							//@ts-ignore
							onSaveClick={() => handleSaveClick(id)}
							onBackClick={() => router.back()}
							imageUrl={workoutPlan?.message.image_url}
						/>
						<WorkoutDetails workoutPlan={workoutPlan?.message} />
					</div>

					<ExerciseList
						exercises={workoutPlan?.message.workout_schedule[0]?.exercises || []}
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