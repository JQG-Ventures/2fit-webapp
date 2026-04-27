'use client';

import Image from 'next/image';
import { FiCheck } from 'react-icons/fi';
import { FaClock, FaFire } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface ReplacementExerciseCardProps {
    exercise: Exercise;
    isSelected: boolean;
    onSelect: () => void;
}

const ReplacementExerciseCard: React.FC<ReplacementExerciseCardProps> = ({
    exercise,
    isSelected,
    onSelect,
}) => {
    const { t } = useTranslation('global');
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

    return (
        <button
            type="button"
            onClick={onSelect}
            className={`flex w-full items-center gap-4 rounded-3xl border p-3 text-left transition-all ${
                isSelected
                    ? 'border-green-400 bg-green-50 shadow-sm shadow-green-500/10'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
            }`}
            aria-label={t('workouts.my-plan.selectReplacement', {
                exerciseName: exercise.name,
            })}
        >
            <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-gray-100">
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

            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-gray-950">
                            {exercise.name}
                        </h3>
                        {muscleGroup && (
                            <p className="mt-1 truncate text-xs font-medium text-gray-500">
                                {muscleGroup}
                            </p>
                        )}
                    </div>
                    <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-sm transition-colors ${
                            isSelected
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-gray-200 bg-white text-transparent'
                        }`}
                    >
                        <FiCheck className="h-4 w-4" />
                    </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <FaFire className="text-green-500" />
                        {exercise.sets} {t('workouts.my-plan.setsLabel')} x {exercise.reps}{' '}
                        {t('workouts.my-plan.repsLabel')}
                    </span>
                    <span className="flex items-center gap-1">
                        <FaClock className="text-green-500" />
                        {restTime} {t('workouts.my-plan.restLabel')}
                    </span>
                </div>
            </div>
        </button>
    );
};

export default ReplacementExerciseCard;
