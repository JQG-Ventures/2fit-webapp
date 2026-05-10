import React from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiClock, FiPlay, FiRepeat, FiX } from 'react-icons/fi';
import { FaDumbbell } from 'react-icons/fa';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import type { AnimationOriginRect } from '@/app/_interfaces/ExerciseFlow';
import type { WorkoutFlowExercise } from '@/app/_types/workoutProgress';

interface ExerciseDetailsModalProp {
    exercise: WorkoutFlowExercise;
    onClose: () => void;
    onStartExercise: () => void;
    animationOrigin?: AnimationOriginRect | null;
    canStartExercise?: boolean;
    startDisabledMessage?: string;
}

const ExerciseDetailsModal: React.FC<ExerciseDetailsModalProp> = ({
    exercise,
    onClose,
    onStartExercise,
    animationOrigin,
    canStartExercise = true,
    startDisabledMessage,
}) => {
    const { t } = useTranslation('global');
    const exerciseName = exercise.name ?? t('workouts.my-plan.notAvailable');
    const muscleGroup = Array.isArray(exercise.muscle_group)
        ? exercise.muscle_group[0]
        : String(exercise.muscle_group ?? '');
    const fallbackLabel = muscleGroup || exerciseName.slice(0, 3);
    const restTime =
        exercise.rest_seconds >= 60
            ? `${Math.floor(exercise.rest_seconds / 60)}m${
                  exercise.rest_seconds % 60 ? ` ${exercise.rest_seconds % 60}s` : ''
              }`
            : `${exercise.rest_seconds}s`;
    const difficultyLabel = exercise.difficulty
        ? t(`workouts.my-plan.difficulty.${exercise.difficulty}`, {
              defaultValue: exercise.difficulty,
          })
        : t('workouts.my-plan.notAvailable');

    const getInitialAnimation = () => {
        if (!animationOrigin || typeof window === 'undefined') {
            return { opacity: 0, scale: 0.96, x: 0, y: 32 };
        }

        const modalWidth = window.innerWidth;
        const modalHeight = window.innerHeight;
        const originCenterX = animationOrigin.left + animationOrigin.width / 2;
        const originCenterY = animationOrigin.top + animationOrigin.height / 2;

        return {
            opacity: 0.96,
            scale: Math.max(
                0.18,
                Math.min(animationOrigin.width / modalWidth, animationOrigin.height / modalHeight),
            ),
            x: originCenterX - window.innerWidth / 2,
            y: originCenterY - window.innerHeight / 2,
        };
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
                className="absolute inset-0 bg-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.45 }}
                transition={{ duration: 0.25 }}
                onClick={onClose}
            />
            <motion.div
                className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#f8faf9] shadow-2xl"
                initial={getInitialAnimation()}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative h-[60dvh] shrink-0 overflow-hidden rounded-b-[2rem] bg-gradient-to-br from-green-50 to-gray-100">
                    {exercise.video_url ? (
                        <video
                            src={exercise.video_url}
                            className="h-full w-full object-cover"
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                    ) : exercise.image_url ? (
                        <Image
                            src={exercise.image_url}
                            alt={exerciseName}
                            fill
                            sizes="100vw"
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <span className="text-3xl font-semibold uppercase text-green-700">
                                {fallbackLabel.slice(0, 4)}
                            </span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-black/10" />
                    <button
                        type="button"
                        className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg backdrop-blur transition-colors hover:bg-white"
                        onClick={onClose}
                        aria-label={t('a11y.closeExerciseList')}
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-5">
                    <p className="text-sm font-medium text-green-600">
                        {t('workouts.my-plan.previewExercise')}
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold leading-tight text-gray-950">
                        {exerciseName}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-gray-500">
                        {exercise.description || t('workouts.my-plan.noExerciseDescription')}
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-3xl border border-gray-100 bg-white p-4">
                            <FaDumbbell className="h-5 w-5 text-green-500" />
                            <div className="mt-3 flex items-baseline gap-2">
                                <p className="text-lg text-gray-400">
                                    {t('workouts.my-plan.setsLabel')}
                                </p>
                                <p className="text-lg font-semibold text-gray-950">
                                    {exercise.sets}
                                </p>
                            </div>
                        </div>
                        <div className="rounded-3xl border border-gray-100 bg-white p-4">
                            <FiRepeat className="h-5 w-5 text-green-500" />
                            <div className="mt-3 flex items-baseline gap-2">
                                <p className="text-lg text-gray-400">
                                    {t('workouts.my-plan.repsLabel')}
                                </p>
                                <p className="text-lg font-semibold text-gray-950">
                                    {exercise.reps}
                                </p>
                            </div>
                        </div>
                        <div className="rounded-3xl border border-gray-100 bg-white p-4">
                            <FiClock className="h-5 w-5 text-green-500" />
                            <div className="mt-3 flex items-baseline gap-2">
                                <p className="text-lg text-gray-400">
                                    {t('workouts.my-plan.restLabel')}
                                </p>
                                <p className="text-lg font-semibold text-gray-950">{restTime}</p>
                            </div>
                        </div>
                        <div className="rounded-3xl border border-gray-100 bg-white p-4">
                            <FiActivity className="h-5 w-5 text-green-500" />
                            <div className="mt-3 flex items-baseline gap-2">
                                <p className="text-lg text-gray-400">
                                    {t('workouts.my-plan.difficultyLabel')}
                                </p>
                                <p className="truncate text-lg font-semibold capitalize text-gray-950">
                                    {difficultyLabel}
                                </p>
                            </div>
                        </div>
                    </div>

                    {muscleGroup && (
                        <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-4">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">
                                {t('workouts.my-plan.muscleGroupLabel')}
                            </p>
                            <p className="mt-1 font-semibold text-gray-900">{muscleGroup}</p>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-100 bg-white/95 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 backdrop-blur">
                    <button
                        type="button"
                        disabled={!canStartExercise}
                        onClick={() => {
                            if (!canStartExercise) return;
                            onStartExercise();
                        }}
                        className={`flex w-full items-center justify-center gap-2 rounded-full px-5 py-5 text-lg font-semibold transition-colors ${
                            canStartExercise
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600'
                                : 'cursor-not-allowed bg-gray-100 text-gray-400'
                        }`}
                    >
                        <FiPlay className="h-5 w-5" />
                        {canStartExercise
                            ? t('workouts.my-plan.startExercise')
                            : startDisabledMessage || t('workouts.my-plan.onlyTodayCompletion')}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ExerciseDetailsModal;
