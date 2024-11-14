'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import WorkoutHeader from '../../../_components/workouts/WorkoutHeader';
import WorkoutDetails from '../../../_components/workouts/WorkoutDetails';
import WorkoutFooter from '../../../_components/workouts/WorkoutFooterStart';
import ExerciseList from '../../../_components/workouts/ExerciseList';
import LoadingScreen from '../../../_components/animations/LoadingScreen';
import SavedMessage from '../../../_components/others/SavedMessage';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import { useFetch } from '../../../_hooks/useFetch';
import { saveWorkout } from '../../../_services/workoutService';
import ExerciseFlow from '@/app/_components/workouts/ExerciseFlow';
import { useSessionContext } from '@/app/_providers/SessionProvider';


const WorkoutPlanPage = () => {
	const router = useRouter();
	const { id } = useParams();
	const { t } = useTranslation('global');
	const { data: session } = useSession();
	const { userId, loading: sessionLoading } = useSessionContext();
	const [savedMessage, setSavedMessage] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showExerciseFlow, setShowExerciseFlow] = useState(false);

	const options = useMemo(() => ({ method: 'GET' }), []);
	const { data: workoutPlan, loading, error } = useFetch(
		id ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/plans/${id}` : '', options);

	const handleSaveClick = async (planId: string) => {
		const result = await saveWorkout(session?.user?.userId!, planId, session?.user?.token!);

		if (result.status === 400) {
			setSavedMessage(t('workouts.plan.workoutAlreadySaved'));
		} else if (result.status === 200) {
			setSavedMessage(t('workouts.plan.workoutSaved'));
		} else {
			setSavedMessage(t('workouts.plan.savingError'));
		}

		setTimeout(() => setSavedMessage(null), 2000);
	};

	const handleStartWorkout = () => {
		console.log(workoutPlan)
		setIsSubmitting(true);
		setShowExerciseFlow(true);
	};

	if (loading) return <LoadingScreen />;
	if (error) return <div>Error loading workout plan.</div>;

	return (
		<div className="bg-gray-50 w-full min-h-screen">
			{showExerciseFlow ? (
				<ExerciseFlow
					exercises={workoutPlan.workout_schedule?.[0]?.exercises || []}
					onClose={() => {
						setShowExerciseFlow(false);
						setIsSubmitting(false);
					}}
					workoutType='oneDay'
					userId={userId!}
					workoutPlanId={id}
				/>
			) : (
				<>
					<div className="flex flex-col justify-center">
						<WorkoutHeader
							onSaveClick={() => handleSaveClick(id)}
							onBackClick={() => router.back()}
							imageUrl={workoutPlan?.image_url}
						/>
						<WorkoutDetails workoutPlan={workoutPlan} />
					</div>

					<ExerciseList
						exercises={workoutPlan.workout_schedule?.[0]?.exercises || []}
						isMobile={true}
					/>

					<WorkoutFooter onStartClick={handleStartWorkout} isSubmitting={isSubmitting} />
					{savedMessage && <SavedMessage message={savedMessage} />}
				</>
			)}
		</div>
	);
};

export default WorkoutPlanPage;
