'use client';

import React from 'react';
import { FaDumbbell } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import type { PlanWithProgress } from '@/app/_types/challenges';

interface Props {
    progressData: PlanWithProgress[];
    onContinue: (planId: string, planType: string) => void;
    isLoading?: boolean;
}

export const ChallengeProgressWidget: React.FC<Props> = ({
    progressData,
    onContinue,
    isLoading = false,
}) => {
    const { t } = useTranslation('global');

    if (isLoading) {
        return (
            <div className="w-full overflow-hidden rounded-3xl shadow-xl bg-white flex flex-col p-6 space-y-4 animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded-lg" />
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="h-6 w-40 bg-gray-200 rounded-lg" />
                </div>
                <div className="h-3 bg-gray-200 rounded-full w-full" />
                <div className="h-5 w-24 bg-gray-200 rounded" />
                <div className="h-12 bg-gray-200 rounded-2xl w-full" />
            </div>
        );
    }

    // filter only "challenge" plans
    const challenges = progressData.filter((plan) => plan.plan_type === 'challenge');

    if (challenges.length === 0) return null;

    return (
        <div className="w-full overflow-hidden rounded-3xl shadow-xl bg-white flex flex-col items-left justify-between p-6 space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                {t('workouts.challenges.activeChallenges')}
            </h2>

            {challenges.map((plan) => {
                const prog = plan.progressData;
                // show placeholder if no progressData yet
                if (!prog) {
                    return (
                        <div key={plan.id} className="animate-pulse flex flex-col space-y-4 py-6">
                            <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/3 mx-auto"></div>
                            <div className="h-3 bg-gray-300 rounded w-full"></div>
                            <div className="h-3 bg-gray-300 rounded w-full"></div>
                        </div>
                    );
                }

                const { total_days, days, name } = prog;
                const completedCount = days.filter((d) => d.is_completed).length;
                const todayInProgress = days.find((d) => d.status === 'in_progress');
                let currentDayNumber = completedCount + 1;
                if (todayInProgress) {
                    currentDayNumber = todayInProgress.sequence_day;
                }
                if (currentDayNumber > total_days) {
                    currentDayNumber = total_days;
                }

                const progressPercent =
                    total_days > 0 ? Math.round((completedCount / total_days) * 100) : 0;
                const progressLabel = `${name}: ${progressPercent}% ${t('workouts.challenges.progressLabel')}`;

                return (
                    <React.Fragment key={plan.id}>
                        <div className="flex items-center space-x-4">
                            <div className="bg-green-500 p-3 rounded-full">
                                <FaDumbbell className="text-white text-xl" />
                            </div>
                            <span className="text-3xl font-semibold text-black">{name}</span>
                        </div>

                        <p className="sr-only">{progressLabel}</p>
                        <div
                            className="w-full bg-gray-200 rounded-full h-3 overflow-hidden"
                            aria-hidden="true"
                        >
                            <svg
                                className="w-full h-3 block"
                                viewBox="0 0 100 3"
                                preserveAspectRatio="none"
                            >
                                <rect
                                    x="0"
                                    y="0"
                                    width={total_days > 0 ? (completedCount / total_days) * 100 : 0}
                                    height="3"
                                    fill="rgb(34 197 94)"
                                    rx="1.5"
                                />
                            </svg>
                        </div>

                        <p className="text-base text-gray-600 font-medium">
                            {`${t('workouts.challenges.day')} ${currentDayNumber} ${t(
                                'workouts.challenges.of',
                            )} ${total_days}`}
                        </p>

                        <button
                            type="button"
                            className="w-full bg-green-500 mt-6 text-white py-3 rounded-2xl text-lg font-semibold hover:bg-green-600 transition"
                            onClick={() => onContinue(plan.id, plan.plan_type)}
                            aria-label={t('a11y.continueChallenge')}
                        >
                            {t('workouts.continue')}
                        </button>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default ChallengeProgressWidget;
