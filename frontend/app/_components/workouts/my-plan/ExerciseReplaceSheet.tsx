'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiCheck, FiRefreshCw, FiX } from 'react-icons/fi';
import { FaClock, FaDumbbell, FaFire } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import ReplacementExerciseCard from '@/app/_components/workouts/my-plan/ReplacementExerciseCard';

interface ExerciseReplaceSheetProps {
    isOpen: boolean;
    currentExercise: Exercise | null;
    options: Exercise[];
    selectedExercise: Exercise | null;
    onSelectExercise: (exercise: Exercise) => void;
    onConfirm: () => void;
    onClose: () => void;
}

const ExerciseReplaceSheet: React.FC<ExerciseReplaceSheetProps> = ({
    isOpen,
    currentExercise,
    options,
    selectedExercise,
    onSelectExercise,
    onConfirm,
    onClose,
}) => {
    const { t } = useTranslation('global');

    if (!isOpen) return null;

    const currentMuscleGroup = Array.isArray(currentExercise?.muscle_group)
        ? currentExercise?.muscle_group[0]
        : String(currentExercise?.muscle_group ?? '');
    const currentFallback = currentMuscleGroup || currentExercise?.name.slice(0, 3) || '';
    const selectedExerciseId = selectedExercise?._id ?? selectedExercise?.exercise_id;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 sm:items-center">
            <motion.div
                className="flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] bg-[#f8faf9] shadow-2xl sm:rounded-[2rem]"
                initial={{ y: 40, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="sticky top-0 z-10 border-b border-gray-100 bg-[#f8faf9]/95 px-5 pb-5 pt-[calc(2rem+env(safe-area-inset-top))] backdrop-blur">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="flex items-center gap-2 text-sm font-medium text-green-600">
                                <FiRefreshCw className="h-4 w-4" />
                                {t('workouts.my-plan.replaceExerciseTitle')}
                            </p>
                            <h2 className="mt-2 text-[1.375rem] font-semibold leading-tight text-gray-950">
                                {t('workouts.my-plan.replaceExerciseSubtitle', {
                                    exerciseName: currentExercise?.name ?? '',
                                })}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50"
                            aria-label={t('a11y.closeExerciseList')}
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    {currentExercise && (
                        <section className="mb-5 rounded-3xl border border-gray-100 bg-white p-3 shadow-sm">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                                {t('workouts.my-plan.currentExercise')}
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-gray-100">
                                    {currentExercise.image_url ? (
                                        <Image
                                            src={currentExercise.image_url}
                                            alt={currentExercise.name}
                                            fill
                                            sizes="112px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <span className="text-xs font-semibold uppercase text-green-700">
                                                {currentFallback.slice(0, 4)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-base font-semibold text-gray-950">
                                        {currentExercise.name}
                                    </h3>
                                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <FaFire className="text-green-500" />
                                            {currentExercise.sets} {t('workouts.my-plan.setsLabel')}{' '}
                                            x {currentExercise.reps}{' '}
                                            {t('workouts.my-plan.repsLabel')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FaClock className="text-green-500" />
                                            {currentExercise.rest_seconds}s{' '}
                                            {t('workouts.my-plan.restLabel')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900">
                                {t('workouts.my-plan.replacementOptions')}
                            </p>
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-500">
                                {options.length}
                            </span>
                        </div>

                        {options.length > 0 ? (
                            <div className="space-y-3 pb-4">
                                {options.map((exercise) => {
                                    const exerciseId = exercise._id ?? exercise.exercise_id;
                                    return (
                                        <ReplacementExerciseCard
                                            key={exerciseId}
                                            exercise={exercise}
                                            isSelected={
                                                !!exerciseId && exerciseId === selectedExerciseId
                                            }
                                            onSelect={() => onSelectExercise(exercise)}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                                    <FaDumbbell className="h-6 w-6" />
                                </div>
                                <h3 className="mt-4 font-semibold text-gray-900">
                                    {t('workouts.my-plan.noReplacementOptions')}
                                </h3>
                            </div>
                        )}
                    </section>
                </div>

                <div className="border-t border-gray-100 bg-white/95 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            {t('workouts.my-plan.cancelReplacement')}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={!selectedExercise}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-colors ${
                                selectedExercise
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600'
                                    : 'cursor-not-allowed bg-gray-100 text-gray-400'
                            }`}
                        >
                            <FiCheck className="h-4 w-4" />
                            {t('workouts.my-plan.confirmReplacement')}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ExerciseReplaceSheet;
