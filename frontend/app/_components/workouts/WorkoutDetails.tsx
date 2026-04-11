'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Tag from '../others/Tag';
import ExerciseList from './ExerciseList';
import Modal from '../modals/ViewModal';
import { FaArrowLeft, FaClock, FaDumbbell, FaFire } from 'react-icons/fa';
import useIsMobile from '../../_hooks/useIsMobile';
import WorkoutFooter from '../../_components/workouts/WorkoutFooterStart';
import { useTranslation } from 'react-i18next';

const WorkoutDetails: React.FC<{ workoutPlan: WorkoutPlan }> = ({ workoutPlan }) => {
    const exercises = workoutPlan.workout_schedule?.[0]?.exercises || [];
    const isMobile = useIsMobile();
    const { t } = useTranslation('global');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getWorkoutStats = (
        schedule: WorkoutSchedule[],
    ): { totalMinutes: number; exerciseCount: number } => {
        let totalSeconds = 0;
        let count = 0;

        schedule?.forEach(({ exercises }) => {
            exercises?.forEach(({ sets = 0, rest_seconds = 0 }) => {
                const duration = sets * 120 + (sets - 1) * rest_seconds;
                totalSeconds += duration;
                count++;
            });
        });

        return { totalMinutes: totalSeconds / 60, exerciseCount: count };
    };

    const { totalMinutes, exerciseCount } = useMemo(
        () => getWorkoutStats(workoutPlan.workout_schedule || []),
        [workoutPlan.workout_schedule],
    );

    const handleSeeAllClick = () => {
        if (isMobile) {
            setIsFullScreen(true);
        } else {
            setIsModalOpen(true);
        }
    };

    const handleStartClick = useCallback(() => {
        setIsSubmitting(true);
        setIsSubmitting(false);
    }, []);

    useEffect(() => {
        if (isFullScreen || isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isFullScreen, isModalOpen]);

    const closeFullScreen = () => {
        setIsFullScreen(false);
    };

    return (
        <div className="my-10 px-10 text-center no-scrollbar flex flex-col items-center mx-auto max-w-3xl">
            <h1 className="text-black text-4xl font-semibold mb-10">{workoutPlan.name}</h1>
            <div className="flex justify-center font-medium capitalize">
                <Tag
                    icon={FaClock}
                    text={`${totalMinutes} min`}
                    iconClassName="mr-2 text-green-600"
                />
                <Tag icon={FaFire} text={workoutPlan.level} iconClassName="mr-2 text-red-500" />
                <Tag
                    icon={FaDumbbell}
                    text={`${exerciseCount} ${t('workouts.plan.exercises')}`}
                    iconClassName="mr-2"
                />
            </div>

            <div className="w-full border-t border-gray-300 mx-auto my-10"></div>

            <div className="flex flex-row justify-between w-full px-2">
                <h2 className="text-3xl">{t('workouts.plan.workoutActivity')}</h2>
                <button
                    type="button"
                    className="text-emerald-600 text-md hover:text-emerald-800"
                    onClick={handleSeeAllClick}
                    aria-label={t('a11y.seeAllExercises')}
                >
                    {t('workouts.plan.seeAll')}
                </button>
            </div>

            {isMobile && isFullScreen && (
                <div className="fixed inset-0 bg-gray-50 z-50 p-10 flex flex-col">
                    <div className="flex flex-row my-4">
                        <button
                            type="button"
                            onClick={closeFullScreen}
                            className="text-3xl"
                            aria-label={t('a11y.closeExerciseList')}
                        >
                            <FaArrowLeft />
                        </button>
                        <h2 className="text-4xl font-semibold ml-8">
                            {t('workouts.plan.workoutActivity')}
                        </h2>
                    </div>
                    <div className="no-scrollbar overflow-y-auto flex-grow">
                        <ExerciseList
                            exercises={exercises}
                            isMobile={true}
                            onExerciseSelect={() => {}}
                        />
                    </div>
                    <WorkoutFooter onStartClick={handleStartClick} isSubmitting={isSubmitting} />
                </div>
            )}

            {!isMobile && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={t('workouts.plan.workoutActivity')}
                >
                    <ExerciseList
                        exercises={exercises}
                        isMobile={false}
                        onExerciseSelect={() => {}}
                    />
                </Modal>
            )}
        </div>
    );
};

export default WorkoutDetails;
