'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Calendar, Flame, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface HomeStatsRowProps {
    streakDays: number;
    sessionsThisWeek: number;
    totalSessions: number;
    isLoading?: boolean;
}

const statValueClass = 'text-3xl font-bold tabular-nums text-gray-900 inline-block origin-center';

function AnimatedStatValue({ value }: { value: number }) {
    const reduceMotion = useReducedMotion();
    const prevRef = useRef<number | null>(null);
    const [bump, setBump] = useState(0);

    useEffect(() => {
        if (prevRef.current === null) {
            prevRef.current = value;
            return;
        }
        if (value > prevRef.current) {
            setBump((b) => b + 1);
        }
        prevRef.current = value;
    }, [value]);

    const shouldAnimate = !reduceMotion && bump > 0;

    return (
        <motion.span
            key={bump}
            className={statValueClass}
            initial={shouldAnimate ? { scale: 1.12, opacity: 0.88 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                type: 'spring',
                stiffness: 420,
                damping: 22,
                mass: 0.65,
            }}
        >
            {value}
        </motion.span>
    );
}

interface StatColumnProps {
    icon: LucideIcon;
    iconClassName: string;
    iconWrapClassName: string;
    value: number;
    label: string;
    dataStat: string;
}

function StatColumn({
    icon: Icon,
    iconClassName,
    iconWrapClassName,
    value,
    label,
    dataStat,
}: StatColumnProps) {
    return (
        <div className="flex min-w-0 flex-1 items-center gap-3">
            <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconWrapClassName}`}
            >
                <Icon className={iconClassName} aria-hidden />
            </div>
            <div className="min-w-0">
                <p className="min-h-[2.25rem]" data-stat={dataStat}>
                    <AnimatedStatValue value={value} />
                </p>
                <p className="text-base text-gray-500 leading-snug">{label}</p>
            </div>
        </div>
    );
}

function ColumnDivider() {
    return <div className="w-px shrink-0 self-stretch bg-gray-200 mx-2 sm:mx-4" aria-hidden />;
}

const HomeStatsRow: React.FC<HomeStatsRowProps> = ({
    streakDays,
    sessionsThisWeek,
    totalSessions,
    isLoading = false,
}) => {
    const { t } = useTranslation('global');
    const hasStreak = streakDays > 0;

    if (isLoading) {
        return (
            <section
                className="px-6 py-6"
                aria-busy="true"
                aria-label={t('home.stats.loadingAria')}
            >
                <div className="flex items-stretch justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    {[1, 2, 3].map((i) => (
                        <React.Fragment key={i}>
                            {i > 1 && <ColumnDivider />}
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div className="h-14 w-14 shrink-0 rounded-xl bg-gray-200 animate-pulse" />
                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="h-8 w-12 rounded bg-gray-200 animate-pulse" />
                                    <div className="h-5 w-24 rounded bg-gray-200 animate-pulse" />
                                </div>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="px-6 py-6" aria-label={t('home.stats.sectionAria')}>
            <div className="flex items-stretch justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
                <StatColumn
                    icon={Flame}
                    iconWrapClassName={hasStreak ? 'bg-orange-100' : 'bg-gray-100'}
                    iconClassName={`h-7 w-7 ${hasStreak ? 'text-orange-500' : 'text-gray-400'}`}
                    value={hasStreak ? streakDays : 0}
                    label={hasStreak ? t('home.stats.streakLabel') : t('home.stats.streakEmpty')}
                    dataStat="streak"
                />
                <ColumnDivider />
                <StatColumn
                    icon={Calendar}
                    iconWrapClassName="bg-green-500/10"
                    iconClassName="h-6 w-6 text-green-600"
                    value={sessionsThisWeek}
                    label={t('home.stats.weekLabel')}
                    dataStat="week"
                />
                <ColumnDivider />
                <StatColumn
                    icon={Trophy}
                    iconWrapClassName="bg-yellow-100"
                    iconClassName="h-7 w-7 text-yellow-600"
                    value={totalSessions}
                    label={t('home.stats.totalLabel')}
                    dataStat="total"
                />
            </div>
        </section>
    );
};

export default HomeStatsRow;
