'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef } from 'react';
import { FaCheck, FaClock, FaFire, FaSpinner } from 'react-icons/fa';
import { FiRefreshCw, FiRotateCcw } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import type { AnimationOriginRect, ExerciseAnimationTargets } from '@/app/_interfaces/ExerciseFlow';

interface ExerciseCardProps {
    exercise: Exercise;
    onClick: (action: 'details' | 'start', targets?: ExerciseAnimationTargets) => void;
    isDeleteMode: boolean;
    isOptionalMode: boolean;
    onDeleteSelect: (exerciseId: string) => void;
    onOptionalSelect: (exerciseId: string) => void;
    onCompleteSelect: (exercise: Exercise) => void;
    selectedForDelete: boolean;
    canComplete: boolean;
    isCompleting: boolean;
    isRecentlyCompleted: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
    exercise,
    onClick,
    isDeleteMode,
    isOptionalMode,
    onDeleteSelect,
    onOptionalSelect,
    onCompleteSelect,
    selectedForDelete,
    canComplete,
    isCompleting,
    isRecentlyCompleted,
}) => {
    const { t } = useTranslation('global');
    const cardRef = useRef<HTMLDivElement>(null);
    const actionRef = useRef<HTMLButtonElement>(null);
    const muscleGroup = Array.isArray(exercise.muscle_group)
        ? exercise.muscle_group[0]
        : String(exercise.muscle_group ?? '');
    const fallbackLabel = muscleGroup || exercise.name.slice(0, 3);
    const restTime =
        exercise.rest_seconds >= 60
            ? `${Math.floor(exercise.rest_seconds / 60)}m${
                  exercise.rest_seconds % 60 ? ` ${exercise.rest_seconds % 60}s` : ''
              }`
            : `${exercise.rest_seconds}s`;
    const readRect = (element: HTMLElement | null): AnimationOriginRect | undefined => {
        const rect = element?.getBoundingClientRect();
        if (!rect) return undefined;

        return {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
        };
    };
    const getAnimationTargets = (): ExerciseAnimationTargets => ({
        previewOrigin: readRect(cardRef.current),
        completionTarget: readRect(actionRef.current),
    });

    return (
        <motion.div
            ref={cardRef}
            layout
            initial={false}
            animate={
                isCompleting
                    ? {
                          scale: [1, 1.01, 1],
                          y: [0, -1, 0],
                      }
                    : isRecentlyCompleted
                      ? {
                            scale: [1, 1.018, 1],
                            y: [0, -2, 0],
                        }
                      : {
                            scale: 1,
                            y: 0,
                        }
            }
            transition={{
                duration: isCompleting ? 1.1 : isRecentlyCompleted ? 0.48 : 0.18,
                ease: 'easeOut',
            }}
            className={`relative flex items-center gap-4 rounded-3xl border p-3 shadow-sm transition-all ${
                isCompleting
                    ? 'border-green-200 bg-green-50/80 shadow-[0_14px_34px_rgba(34,197,94,0.14)]'
                    : isRecentlyCompleted
                      ? 'border-green-200 bg-green-50/70 shadow-[0_14px_34px_rgba(34,197,94,0.12)]'
                      : exercise.is_completed
                        ? 'border-gray-100 bg-gray-50'
                        : 'border-gray-100 bg-white hover:shadow-md'
            } ${selectedForDelete ? 'border-red-300 bg-red-50' : ''}`}
            onClick={() =>
                !isDeleteMode &&
                !isOptionalMode &&
                !isCompleting &&
                onClick('details', getAnimationTargets())
            }
        >
            <div
                className={`relative h-24 w-28 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-gray-100 ${
                    exercise.is_completed && !isRecentlyCompleted ? 'opacity-70' : ''
                }`}
            >
                {exercise.image_url ? (
                    <Image
                        src={exercise.image_url}
                        alt={exercise.name}
                        fill
                        sizes="112px"
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <span className="text-xs font-semibold uppercase text-green-700">
                            {fallbackLabel.slice(0, 4)}
                        </span>
                    </div>
                )}
            </div>
            <div
                className={`flex min-w-0 flex-1 flex-col justify-center ${
                    exercise.is_completed && !isRecentlyCompleted ? 'opacity-70' : ''
                }`}
            >
                <h3
                    className={`truncate text-base font-semibold text-gray-900 ${
                        exercise.is_completed && !isRecentlyCompleted
                            ? 'line-through decoration-gray-400'
                            : ''
                    }`}
                >
                    {exercise.name}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <FaFire className="text-green-500" />
                        {exercise.sets} sets x {exercise.reps} reps
                    </span>
                    <span className="flex items-center gap-1">
                        <FaClock className="text-green-500" />
                        {restTime} {t('workouts.my-plan.restLabel')}
                    </span>
                </div>
                {muscleGroup && (
                    <span className="mt-2 w-fit rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                        {muscleGroup}
                    </span>
                )}
                <AnimatePresence initial={false}>
                    {isCompleting && (
                        <motion.span
                            key="completing"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="mt-2 w-fit rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700"
                        >
                            {t('workouts.my-plan.completingExercise')}
                        </motion.span>
                    )}
                    {!isCompleting && isRecentlyCompleted && (
                        <motion.span
                            key="completed"
                            initial={{ opacity: 0, y: 6, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="mt-2 w-fit rounded-full bg-green-600 px-2.5 py-1 text-xs font-semibold text-white"
                        >
                            {t('workouts.my-plan.exerciseCompleted')}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex shrink-0 items-center justify-center">
                {isDeleteMode ? (
                    <button
                        ref={actionRef}
                        type="button"
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white shadow-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            const id = exercise.exercise_id ?? exercise._id;
                            if (id) onDeleteSelect(id);
                        }}
                        aria-label={`${t('a11y.markForRemoval')}: ${exercise.name}`}
                    >
                        <IoClose size={22} />
                    </button>
                ) : isOptionalMode ? (
                    <button
                        ref={actionRef}
                        type="button"
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500 text-white shadow-sm transition-colors hover:bg-green-600"
                        onClick={(e) => {
                            e.stopPropagation();
                            const id = exercise.exercise_id ?? exercise._id;
                            if (id) onOptionalSelect(id);
                        }}
                        aria-label={`${t('a11y.changeExerciseChoice')}: ${exercise.name}`}
                    >
                        <FiRefreshCw className="h-4 w-4" />
                    </button>
                ) : isCompleting ? (
                    <motion.button
                        ref={actionRef}
                        type="button"
                        disabled
                        initial={false}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'easeInOut',
                        }}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500 text-white shadow-[0_10px_22px_rgba(34,197,94,0.34)]"
                        aria-label={`${t('workouts.my-plan.completingExercise')}: ${exercise.name}`}
                        aria-busy="true"
                        data-testid="exercise-completing-button"
                    >
                        <FaSpinner className="h-4 w-4 animate-spin" />
                    </motion.button>
                ) : exercise.is_completed && isRecentlyCompleted ? (
                    <motion.button
                        ref={actionRef}
                        type="button"
                        disabled
                        initial={{ scale: 0.86 }}
                        animate={{ scale: [1, 1.14, 1] }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-green-500 text-white shadow-[0_10px_22px_rgba(34,197,94,0.34)]"
                        aria-label={`${t('workouts.my-plan.exerciseCompleted')}: ${exercise.name}`}
                        data-testid="exercise-completed-button"
                    >
                        <motion.span
                            className="absolute inset-0 rounded-full border-2 border-green-300"
                            initial={{ scale: 0.8, opacity: 0.9 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 0.55, ease: 'easeOut' }}
                        />
                        <FaCheck className="h-4 w-4" />
                    </motion.button>
                ) : exercise.is_completed ? (
                    <button
                        ref={actionRef}
                        type="button"
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-600 shadow-sm transition-colors hover:bg-gray-200"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        aria-label={`${t('workouts.my-plan.redoExercise')}: ${exercise.name}`}
                    >
                        <FiRotateCcw className="h-4 w-4" />
                    </button>
                ) : (
                    <button
                        ref={actionRef}
                        type="button"
                        disabled={!canComplete || isCompleting}
                        className={`flex h-11 w-11 items-center justify-center rounded-full shadow-sm transition-colors ${
                            canComplete
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'cursor-not-allowed bg-gray-100 text-gray-300'
                        }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!canComplete) return;
                            onCompleteSelect(exercise);
                        }}
                        aria-label={`${
                            canComplete
                                ? t('workouts.my-plan.markExerciseDone')
                                : t('workouts.my-plan.onlyTodayCompletion')
                        }: ${exercise.name}`}
                    >
                        <FaCheck className="h-4 w-4" />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default ExerciseCard;
