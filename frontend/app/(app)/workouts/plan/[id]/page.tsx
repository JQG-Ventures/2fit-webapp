'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import WorkoutHeader from '@/app/_components/workouts/WorkoutHeader';
import WorkoutDetails from '@/app/_components/workouts/WorkoutDetails';
import WorkoutFooter from '@/app/_components/workouts/WorkoutFooterStart';
import ExerciseList from '@/app/_components/workouts/ExerciseList';
import SavedMessage from '@/app/_components/others/SavedMessage';
import { useTranslation } from 'react-i18next';
import ExerciseFlow from '@/app/_components/workouts/ExerciseFlow';
import { useApiGet } from '@/app/utils/apiClient';
import { useSaveWorkout } from '@/app/_services/userService';
import { useSession } from 'next-auth/react';
import type { ApiResponse } from '@/app/_types/api';

interface AppSession {
    user?: {
        id?: string | null;
        userId?: string | null;
    };
}

const WorkoutPlanPage: React.FC = () => {
    const router = useRouter();
    const params = useParams() as { id?: string };
    const workoutPlanId = params.id ?? '';
    const { t } = useTranslation('global');
    const { data: sessionData } = useSession();
    const session = sessionData as AppSession | null;
    const userId = session?.user?.id ?? session?.user?.userId ?? '';
    const [savedMessage, setSavedMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showExerciseFlow, setShowExerciseFlow] = useState<boolean>(false);
    const { mutate: saveWorkout } = useSaveWorkout();

    const getActivePlansUrl = `/api/workouts/plans/${workoutPlanId}`;
    const { data: workoutPlan, isError: error } = useApiGet<ApiResponse<WorkoutPlan>>(
        [],
        getActivePlansUrl,
    );
    const currentWorkoutPlan = workoutPlan?.message;

    const handleSaveClick = useCallback(
        async (planId: string) => {
            saveWorkout(
                { queryParams: { workout_id: planId } },
                {
                    onSuccess: (data) => {
                        if (data.status === 'success') {
                            setSavedMessage(t('workouts.plan.workoutSaved'));
                            setTimeout(() => setSavedMessage(null), 3000);
                        }
                    },
                    onError: (error) => {
                        if (error.response?.status === 400) {
                            setSavedMessage(t('workouts.plan.workoutAlreadySaved'));
                        } else {
                            setSavedMessage(t('workouts.plan.savingError'));
                        }
                        setTimeout(() => setSavedMessage(null), 3000);
                    },
                },
            );
        },
        [t, saveWorkout],
    );

    const handleStartWorkout = useCallback(() => {
        setIsSubmitting(true);
        setShowExerciseFlow(true);
    }, []);

    const handleExerciseFlowClose = useCallback(() => {
        setShowExerciseFlow(false);
        setIsSubmitting(false);
    }, []);

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-center text-red-500">{t('workouts.plan.errorLoading')}</p>
            </div>
        );
    }

    if (!currentWorkoutPlan) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-center text-gray-500">{t('workouts.loading')}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 w-full min-h-screen">
            {showExerciseFlow ? (
                <ExerciseFlow
                    exercises={currentWorkoutPlan.workout_schedule[0]?.exercises || []}
                    onClose={handleExerciseFlowClose}
                    onExerciseComplete={() => {}}
                    workoutType="oneDay"
                    userId={userId}
                    workoutPlanId={workoutPlanId}
                />
            ) : (
                <>
                    <div className="flex flex-col justify-center">
                        <WorkoutHeader
                            onSaveClick={() => handleSaveClick(workoutPlanId)}
                            onBackClick={() => router.back()}
                            imageUrl={currentWorkoutPlan.image_url}
                        />
                        <WorkoutDetails workoutPlan={currentWorkoutPlan} />
                    </div>

                    <ExerciseList
                        exercises={currentWorkoutPlan.workout_schedule[0]?.exercises || []}
                        isMobile={true}
                        onExerciseSelect={() => {}}
                    />

                    <WorkoutFooter onStartClick={handleStartWorkout} isSubmitting={isSubmitting} />
                    {savedMessage && <SavedMessage message={savedMessage} />}
                </>
            )}
        </div>
    );
};

export default React.memo(WorkoutPlanPage);
