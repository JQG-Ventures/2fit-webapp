'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { FaCheckCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import type { WorkoutFlowExercise } from '@/app/_types/workoutProgress';

interface BottomSheetProps {
    exercises: WorkoutFlowExercise[];
    currentExerciseIndex: number;
    currentSet: number;
    onComplete?: () => void;
    isRestView?: boolean;
    nextPreviewExercise?: WorkoutFlowExercise;
    onAddTime?: () => void;
    onSubtractTime?: () => void;
    onSkipRest?: () => void;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
    exercises,
    currentExerciseIndex,
    currentSet,
    onComplete,
    isRestView,
    nextPreviewExercise,
    onAddTime,
    onSubtractTime,
    onSkipRest,
}) => {
    const restPreview = isRestView && nextPreviewExercise;
    const { t } = useTranslation('global');
    const [expanded, setExpanded] = useState(false);
    const currentExercise = restPreview ? nextPreviewExercise : exercises[currentExerciseIndex];
    const currentExerciseName = currentExercise?.name ?? t('workouts.my-plan.notAvailable');
    const currentExerciseImage = currentExercise?.image_url;

    return (
        <div
            className={`fixed bottom-0 left-0 z-50 w-full rounded-t-[2rem] border-t border-gray-100 bg-white transition-all duration-300 ${
                expanded ? 'h-[80vh]' : 'pb-[calc(1.25rem+env(safe-area-inset-bottom))]'
            } shadow-[0_-10px_40px_rgba(15,23,42,0.12)]`}
        >
            <div
                className="absolute left-1/2 top-3 z-10 h-1.5 w-14 -translate-x-1/2 cursor-pointer rounded-full bg-gray-200"
                onClick={() => setExpanded((prev) => !prev)}
            ></div>

            <div className="flex h-full w-full flex-col px-0 pt-9">
                <div className="space-y-5 px-5">
                    <div className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-[#f8faf9] p-3">
                        <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                            {currentExerciseImage ? (
                                <Image
                                    src={currentExerciseImage}
                                    alt={currentExerciseName}
                                    fill
                                    sizes="112px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <span className="text-xs font-semibold uppercase text-green-700">
                                        {currentExerciseName.slice(0, 4)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-green-600">
                                {restPreview
                                    ? t('RestView.nextEx')
                                    : t('workouts.my-plan.previewExercise')}
                            </p>
                            <h3 className="mt-1 truncate text-[1.35rem] font-semibold leading-tight text-gray-950">
                                {currentExerciseName}
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                {`${currentExercise?.reps ?? 0} reps • ${currentExercise?.rest_seconds ?? 0}s ${t(
                                    'workouts.my-plan.restLabel',
                                )}`}
                            </p>
                        </div>
                    </div>

                    {!isRestView && (
                        <button
                            type="button"
                            onClick={onComplete}
                            className="w-full rounded-full bg-green-500 py-5 text-lg font-semibold text-white shadow-lg shadow-green-500/20 transition-colors hover:bg-green-600"
                            aria-label={t('ExerciseFlow.complete')}
                        >
                            {t('ExerciseFlow.complete')}
                        </button>
                    )}

                    {isRestView && (
                        <div className="flex justify-between gap-4">
                            <button
                                type="button"
                                onClick={onSubtractTime}
                                className="rounded-full border border-gray-200 bg-white px-6 py-4 text-xl font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                                aria-label={t('a11y.decreaseRest')}
                            >
                                -5
                            </button>
                            <button
                                type="button"
                                onClick={onSkipRest}
                                className="w-full rounded-full bg-green-500 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-green-500/20 transition-colors hover:bg-green-600"
                                aria-label={t('RestView.skip')}
                            >
                                {t('RestView.skip')}
                            </button>
                            <button
                                type="button"
                                onClick={onAddTime}
                                className="rounded-full border border-gray-200 bg-white px-6 py-4 text-xl font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                                aria-label={t('a11y.increaseRest')}
                            >
                                +5
                            </button>
                        </div>
                    )}
                </div>

                {expanded && (
                    <div className="mt-6 overflow-y-auto px-3 pb-20">
                        {exercises.map((exercise, exIdx) => {
                            const isCompleted = exIdx < currentExerciseIndex;
                            const isCurrent = exIdx === currentExerciseIndex;
                            const sets = Array.from({ length: exercise.sets }, (_, i) => i + 1);
                            const exerciseName =
                                exercise.name ?? t('workouts.my-plan.notAvailable');

                            return (
                                <div
                                    key={`${exercise.exercise_id ?? exercise._id ?? exIdx}`}
                                    className="w-full"
                                >
                                    {sets.map((setNumber, _setIdx) => {
                                        const isSetCompleted =
                                            isCompleted || (isCurrent && setNumber < currentSet);
                                        const isCurrentSet = isCurrent && setNumber === currentSet;
                                        return (
                                            <div
                                                key={`set-${setNumber}`}
                                                className={`flex items-center gap-4 rounded-3xl px-3 py-3 ${
                                                    isCurrentSet ? 'bg-green-50' : ''
                                                }`}
                                            >
                                                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                                                    {exercise.image_url ? (
                                                        <Image
                                                            src={exercise.image_url}
                                                            alt={exerciseName}
                                                            fill
                                                            sizes="96px"
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <span className="text-xs font-semibold uppercase text-green-700">
                                                                {exerciseName.slice(0, 4)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="truncate text-base font-semibold text-gray-950">
                                                            {exerciseName}
                                                        </h3>
                                                        {isSetCompleted && (
                                                            <FaCheckCircle className="ml-2 text-xl text-green-500" />
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {exercise.reps} reps •{' '}
                                                        {exercise.rest_seconds}s{' '}
                                                        {t('workouts.my-plan.restLabel')}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {exIdx < exercises.length - 1 && (
                                        <div className="py-2 text-center text-sm text-gray-400">
                                            {t('ExerciseFlow.restIndicator', {
                                                seconds: exercise.rest_seconds,
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BottomSheet;
