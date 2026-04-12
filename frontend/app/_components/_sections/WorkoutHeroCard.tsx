'use client';

import React, { useState, useTransition } from 'react';
import { FaPlay, FaDumbbell, FaSpinner } from 'react-icons/fa';
import { FiCalendar } from 'react-icons/fi';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { translateFitnessLevel } from '@/app/utils/translateFitnessLevel';

interface WorkoutHeroCardProps {
    pendingExercise: {
        name: string;
        description: string;
        difficulty: string;
        image_url: string;
    } | null;
    planProgress: number;
    hasPlan: boolean;
    isLoading?: boolean;
}

const WorkoutHeroCard: React.FC<WorkoutHeroCardProps> = ({
    pendingExercise,
    planProgress,
    hasPlan,
    isLoading = false,
}) => {
    const { t } = useTranslation('global');
    const [loading, setLoading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleCTA = () => {
        setLoading(true);
        startTransition(() => {
            router.push('/workouts');
        });
    };

    if (isLoading) {
        return (
            <div className="mx-6 p-7 bg-gray-900 rounded-3xl animate-pulse">
                <div className="h-7 w-32 bg-gray-700 rounded-full mb-5" />
                <div className="h-8 w-3/4 bg-gray-700 rounded-lg mb-3" />
                <div className="flex gap-4 mb-6">
                    <div className="h-5 w-20 bg-gray-700 rounded-full" />
                    <div className="h-5 w-32 bg-gray-700 rounded-full" />
                </div>
                <div className="mb-6">
                    <div className="flex justify-between mb-2">
                        <div className="h-4 w-28 bg-gray-700 rounded" />
                        <div className="h-4 w-10 bg-gray-700 rounded" />
                    </div>
                    <div className="h-2.5 bg-gray-700 rounded-full" />
                </div>
                <div className="h-14 bg-gray-700 rounded-2xl" />
            </div>
        );
    }

    if (!hasPlan) {
        return (
            <div className="mx-6 p-7 bg-gray-900 rounded-3xl">
                <div className="flex items-start gap-4 mb-6">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/20 shrink-0">
                        <Sparkles className="w-7 h-7 text-green-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                            {t('home.workoutHero.noPlanTitle')}
                        </h2>
                        <p className="text-base text-gray-400 leading-relaxed">
                            {t('home.workoutHero.noPlanDescription')}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleCTA}
                    disabled={loading || isPending}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold text-lg rounded-2xl px-6 py-3.5 flex items-center justify-center gap-2 transition-colors"
                >
                    {loading || isPending ? (
                        <FaSpinner className="animate-spin text-lg" />
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            {t('home.workoutHero.noPlanCTA')}
                        </>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className="mx-6 p-7 bg-gray-900 rounded-3xl">
            <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full">
                    <FiCalendar className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-semibold text-green-400">
                        {t('home.workoutHero.workoutOfTheDay')}
                    </span>
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
                    {pendingExercise?.name}
                </h2>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-gray-400 text-lg">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        {translateFitnessLevel(pendingExercise?.difficulty, t)}
                    </span>
                    <span className="flex items-center gap-2">
                        <FaDumbbell className="w-4 h-4" />
                        {pendingExercise?.description
                            ? pendingExercise.description.slice(0, 40) + '...'
                            : t('home.workoutHero.defaultDescription')}
                    </span>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-lg text-gray-400">
                        {t('home.workoutHero.planProgress')}
                    </span>
                    <span className="text-lg font-semibold text-green-400">{planProgress}%</span>
                </div>
                <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden" aria-hidden="true">
                    <svg
                        data-testid="workout-hero-plan-progress"
                        className="h-2.5 w-full block text-green-500"
                        viewBox="0 0 100 2.5"
                        preserveAspectRatio="none"
                    >
                        <rect
                            x="0"
                            y="0"
                            width={Math.min(100, Math.max(0, planProgress))}
                            height="2.5"
                            fill="currentColor"
                            rx="1.25"
                        />
                    </svg>
                </div>
            </div>

            <button
                type="button"
                onClick={handleCTA}
                disabled={loading || isPending}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold text-lg rounded-2xl px-6 py-3.5 flex items-center justify-center gap-2 transition-colors"
            >
                {loading || isPending ? (
                    <FaSpinner className="animate-spin text-lg" />
                ) : (
                    <>
                        <FaPlay className="text-base" />
                        {t('home.workoutHero.continueCTA')}
                    </>
                )}
            </button>
        </div>
    );
};

export default WorkoutHeroCard;
