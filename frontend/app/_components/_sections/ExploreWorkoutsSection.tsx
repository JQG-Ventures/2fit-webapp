'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { HomeDiscoveryCard } from '@/app/_types/homeDiscovery';
import { translateFitnessLevel } from '@/app/utils/translateFitnessLevel';

function discoveryHref(card: HomeDiscoveryCard): string {
    return card.card_type === 'challenge'
        ? `/workouts/challenges/${card.id}`
        : `/workouts/plan/${card.id}`;
}

interface ExploreWorkoutsSectionProps {
    cards: HomeDiscoveryCard[];
    isLoading?: boolean;
}

const ExploreWorkoutsSection: React.FC<ExploreWorkoutsSectionProps> = ({
    cards,
    isLoading = false,
}) => {
    const { t } = useTranslation('global');

    if (isLoading) {
        return (
            <section className="px-6 py-6">
                <div className="flex justify-between items-baseline mb-4">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="shrink-0 w-[min(280px,85vw)] h-[200px] bg-gray-200 rounded-2xl animate-pulse"
                        />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="px-6 py-6" aria-labelledby="explore-workouts-heading">
            <div className="flex justify-between items-baseline mb-4">
                <h2
                    id="explore-workouts-heading"
                    className="text-3xl font-bold text-gray-900 tracking-tight"
                >
                    {t('home.discovery.exploreTitle')}
                </h2>
                <Link
                    href="/workouts"
                    className="text-base font-semibold text-green-600 hover:text-green-700 hover:underline shrink-0 ml-2"
                >
                    {t('home.discovery.viewAll')}
                </Link>
            </div>

            {cards.length === 0 ? (
                <p className="text-lg text-gray-500 text-center py-8">
                    {t('home.discovery.emptyExplore')}
                </p>
            ) : (
                <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 scrollbar-thin">
                    {cards.map((card) => (
                        <Link
                            key={`${card.card_type}-${card.id}`}
                            href={discoveryHref(card)}
                            className="relative shrink-0 w-[min(280px,85vw)] h-[200px] rounded-2xl overflow-hidden shadow-md snap-start group bg-gray-800"
                        >
                            {card.image_url ? (
                                <Image
                                    src={card.image_url}
                                    alt=""
                                    fill
                                    className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                                    sizes="280px"
                                />
                            ) : (
                                <div
                                    className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900"
                                    aria-hidden
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                <p className="text-xs font-medium text-white/90 leading-snug">
                                    {t('home.discovery.metaLine', {
                                        minutes: card.estimated_minutes,
                                        level: translateFitnessLevel(card.level, t),
                                    })}
                                </p>
                                <p className="text-xl font-bold leading-snug line-clamp-2 mt-1.5">
                                    {card.title}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
};

export default ExploreWorkoutsSection;
