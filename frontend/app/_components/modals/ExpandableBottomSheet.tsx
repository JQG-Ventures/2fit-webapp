'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { FaCheckCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface BottomSheetProps {
    exercises: Exercise[];
    currentExerciseIndex: number;
    currentSet: number;
    onComplete?: () => void;
    isRestView?: boolean;
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
    onAddTime,
    onSubtractTime,
    onSkipRest,
}) => {
    const { t } = useTranslation('global');
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className={`fixed bottom-0 left-0 w-full z-50 rounded-t-3xl bg-white transition-all duration-300 ${
                expanded ? 'h-[80vh]' : 'pb-6'
            } shadow-[0_-4px_20px_rgba(0,0,0,0.15)] border-t border-gray-200`}
        >
            <div
                className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-2 bg-gray-300 rounded-full opacity-50 z-10 cursor-pointer"
                onClick={() => setExpanded((prev) => !prev)}
            ></div>

            <div className="flex flex-col h-full w-full px-0 pt-8">
                <div className="px-6 space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="relative w-36 h-36 rounded-xl overflow-hidden flex-shrink-0">
                            <Image
                                src={
                                    isRestView
                                        ? exercises[currentExerciseIndex + 1]?.image_url
                                        : exercises[currentExerciseIndex].image_url
                                }
                                alt={exercises[currentExerciseIndex]?.name}
                                layout="fill"
                                objectFit="cover"
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-3xl font-semibold leading-tight">
                                {isRestView
                                    ? exercises[currentExerciseIndex + 1]?.name
                                    : exercises[currentExerciseIndex].name}
                            </h3>
                            <p className="text-xl mt-2 text-gray-600">
                                {exercises[currentExerciseIndex]?.reps} reps • Rest{' '}
                                {exercises[currentExerciseIndex]?.rest_seconds}s
                            </p>
                        </div>
                    </div>

                    {!isRestView && (
                        <button
                            type="button"
                            onClick={onComplete}
                            className="w-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white py-5 rounded-full text-xl font-semibold shadow-lg hover:bg-emerald-500 transition-all"
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
                                className="py-4 px-6 rounded-full border border-gray-300 text-xl font-bold shadow-sm"
                                aria-label={t('a11y.decreaseRest')}
                            >
                                -5
                            </button>
                            <button
                                type="button"
                                onClick={onSkipRest}
                                className="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white py-4 px-6 rounded-full text-xl font-semibold shadow-lg w-full"
                                aria-label={t('RestView.skip')}
                            >
                                {t('RestView.skip')}
                            </button>
                            <button
                                type="button"
                                onClick={onAddTime}
                                className="py-4 px-6 rounded-full border border-gray-300 text-xl font-bold shadow-sm"
                                aria-label={t('a11y.increaseRest')}
                            >
                                +5
                            </button>
                        </div>
                    )}
                </div>

                {expanded && (
                    <div className="overflow-y-auto mt-6 px-0 pb-20">
                        {exercises.map((exercise, exIdx) => {
                            const isCompleted = exIdx < currentExerciseIndex;
                            const isCurrent = exIdx === currentExerciseIndex;
                            const sets = Array.from({ length: exercise.sets }, (_, i) => i + 1);

                            return (
                                <div key={`${exercise.exercise_id}-${exIdx}`} className="w-full">
                                    {sets.map((setNumber, _setIdx) => {
                                        const isSetCompleted =
                                            isCompleted || (isCurrent && setNumber < currentSet);
                                        const isCurrentSet = isCurrent && setNumber === currentSet;
                                        return (
                                            <div
                                                key={`set-${setNumber}`}
                                                className={`flex items-center space-x-4 px-4 py-4 ${
                                                    isCurrentSet ? 'bg-emerald-50' : ''
                                                }`}
                                            >
                                                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={exercise.image_url}
                                                        alt={exercise.name}
                                                        layout="fill"
                                                        objectFit="cover"
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-2xl font-semibold">
                                                            {exercise.name}
                                                        </h3>
                                                        {isSetCompleted && (
                                                            <FaCheckCircle className="text-green-500 text-xl ml-2" />
                                                        )}
                                                    </div>
                                                    <p className="text-lg text-gray-600 mt-1">
                                                        {exercise.reps} reps • Rest{' '}
                                                        {exercise.rest_seconds}s
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {exIdx < exercises.length - 1 && (
                                        <div className="text-center py-2 text-gray-400 text-sm">
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
