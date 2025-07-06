'use client';

import React, { useState, useCallback } from 'react';
import WorkoutHeader from '@/app/_components/workouts/WorkoutHeader';
import WorkoutDetails from '@/app/_components/workouts/WorkoutDetails';
import ExerciseList from '@/app/_components/workouts/ExerciseList';
import WorkoutFooter from '@/app/_components/workouts/WorkoutFooterStart';
import ExerciseFlow from '@/app/_components/workouts/ExerciseFlow';
import SavedMessage from '@/app/_components/others/SavedMessage';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';

interface ChallengeDayViewerProps {
    challengeId: string;
    challengeName: string;
    imageUrl: string;
    level: string;
    exercises: any[];
    sequenceDay: number;
    onClose: () => void;
}

const ChallengeDayViewer: React.FC<ChallengeDayViewerProps> = ({
    challengeId,
    challengeName,
    imageUrl,
    level,
    exercises,
    sequenceDay,
    onClose,
}) => {
    const { data: session } = useSession();
    const userId = session?.user?.id!;
    const { t } = useTranslation('global');

    const [showExerciseFlow, setShowExerciseFlow] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [savedMessage, setSavedMessage] = useState<string | null>(null);

    const handleStartWorkout = useCallback(() => {
        setIsSubmitting(true);
        setShowExerciseFlow(true);
    }, []);

    const handleExerciseFlowClose = useCallback(() => {
        setShowExerciseFlow(false);
        setIsSubmitting(false);
    }, []);

    return (
        <div className="bg-gray-50 w-full min-h-screen">
            {showExerciseFlow ? (
                <ExerciseFlow
                    exercises={exercises || []}
                    onClose={handleExerciseFlowClose}
                    onExerciseComplete={() => {}}
                    workoutType="challenge"
                    userId={userId}
                    workoutPlanId={challengeId}
                    {...{ sequenceDay }}
                />
            ) : (
                <>
                    <WorkoutHeader
                        onSaveClick={() => setSavedMessage(t('workouts.plan.workoutSaved'))}
                        onBackClick={onClose}
                        imageUrl={imageUrl}
                    />
                    <WorkoutDetails
                        workoutPlan={{
                            _id: challengeId,
                            name: `${t(
                                'workouts.challenges.day',
                            )} ${sequenceDay} • ${challengeName}`,
                            description: '',
                            plan_type: 'challenge',
                            duration_weeks: 0,
                            price: 0,
                            image_url: imageUrl,
                            video_url: '',
                            workout_schedule: [{ exercises }],
                            level,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            is_active: true,
                        }}
                    />

                    <ExerciseList
                        exercises={exercises || []}
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

export default React.memo(ChallengeDayViewer);
