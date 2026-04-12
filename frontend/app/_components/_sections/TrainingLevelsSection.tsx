'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { HomeDiscoveryCard, HomeLevelFilter } from '@/app/_types/homeDiscovery';

function discoveryHref(card: HomeDiscoveryCard): string {
    return card.card_type === 'challenge'
        ? `/workouts/challenges/${card.id}`
        : `/workouts/plan/${card.id}`;
}

interface TrainingLevelsSectionProps {
    cards: HomeDiscoveryCard[];
    isLoading?: boolean;
    selectedLevel: HomeLevelFilter;
    onLevelChange: (level: HomeLevelFilter) => void;
}

const TrainingLevelsSection: React.FC<TrainingLevelsSectionProps> = ({
    cards,
    isLoading = false,
    selectedLevel,
    onLevelChange,
}) => {
    const { t } = useTranslation('global');

    const filters: { id: HomeLevelFilter; labelKey: string }[] = useMemo(
        () => [
            { id: 'all', labelKey: 'home.discovery.filterAll' },
            { id: 'beginner', labelKey: 'home.discovery.filterBeginner' },
            { id: 'intermediate', labelKey: 'home.discovery.filterIntermediate' },
            { id: 'advanced', labelKey: 'home.discovery.filterAdvanced' },
        ],
        [],
    );

    if (isLoading) {
        return (
            <section className="px-6 py-6">
                <div className="h-8 w-56 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="flex gap-2 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-9 w-24 bg-gray-200 rounded-full animate-pulse" />
                    ))}
                </div>
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-36 w-full bg-gray-200 rounded-2xl mb-4 animate-pulse"
                    />
                ))}
            </section>
        );
    }

    return (
        <section className="px-6 py-6" aria-labelledby="training-levels-heading">
            <div className="flex justify-between items-baseline mb-4">
                <h2
                    id="training-levels-heading"
                    className="text-3xl font-bold text-gray-900 tracking-tight"
                >
                    {t('home.discovery.trainingLevelsTitle')}
                </h2>
                <Link
                    href="/workouts"
                    className="text-base font-semibold text-green-600 hover:text-green-700 hover:underline shrink-0 ml-2"
                >
                    {t('home.discovery.viewAll')}
                </Link>
            </div>

            <div
                className="flex flex-wrap gap-2 mb-6"
                role="tablist"
                aria-label={t('home.discovery.trainingLevelsTitle')}
            >
                {filters.map(({ id, labelKey }) => {
                    const active = selectedLevel === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={active ? 'true' : 'false'}
                            onClick={() => onLevelChange(id)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                                active
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {t(labelKey)}
                        </button>
                    );
                })}
            </div>

            {cards.length === 0 ? (
                <p className="text-lg text-gray-500 text-center py-8">
                    {t('home.discovery.emptyTraining')}
                </p>
            ) : (
                <ul className="flex flex-col gap-4">
                    {cards.map((card) => (
                        <li key={`${card.card_type}-${card.id}`}>
                            <Link
                                href={discoveryHref(card)}
                                className="flex rounded-2xl overflow-hidden shadow-md bg-white h-36 md:h-40 group"
                            >
                                <div className="relative w-[40%] min-w-[120px] shrink-0 h-full min-h-[9rem] bg-gray-800">
                                    {card.image_url ? (
                                        <Image
                                            src={card.image_url}
                                            alt=""
                                            fill
                                            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                                            sizes="(max-width: 768px) 40vw, 200px"
                                        />
                                    ) : (
                                        <div
                                            className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900"
                                            aria-hidden
                                        />
                                    )}
                                </div>
                                <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
                                    <p className="text-sm text-gray-500 font-medium tabular-nums">
                                        {t('home.discovery.metaMinutes', {
                                            minutes: card.estimated_minutes,
                                        })}
                                    </p>
                                    <p className="text-lg font-bold text-gray-900 line-clamp-2 mt-1 tracking-tight">
                                        {card.title}
                                    </p>
                                    <p className="text-base text-gray-600 mt-2 leading-snug">
                                        {t('home.discovery.metaDaysExercises', {
                                            days: card.day_count,
                                            exercises: card.exercise_count,
                                        })}
                                    </p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default TrainingLevelsSection;
