'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaFire, FaDumbbell, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useApiGet } from '@/app/utils/apiClient';
import { useParams, useRouter } from 'next/navigation';
import ChallengeDayViewer from '@/app/_components/workouts/challenges/ChallengeViewer';

function transformChallenge(challenge: RawChallenge): FormattedChallenge {
    const weeks = Math.ceil(challenge.duration_days / 7);
    const sortedDays = Array.from({ length: challenge.duration_days }).map((_, i) => {
        const match = challenge.workout_schedule.find((d) => d.sequence_day === i + 1);
        return match ? { name: match.name, rest: match.is_rest } : { rest: true };
    });
    const schedule = Array.from({ length: weeks }).map((_, i) => ({
        week: i + 1,
        days: sortedDays.slice(i * 7, (i + 1) * 7),
    }));
    return {
        title: challenge.name,
        description: challenge.description,
        days: challenge.duration_days,
        difficulty: challenge.level,
        equipment: !!(challenge.equipment && challenge.equipment.length > 0),
        image: challenge.image_url,
        schedule,
    };
}

const ChallengeDetailPage: React.FC = () => {
    const router = useRouter();
    const { t } = useTranslation('global');
    const [activeWeek, setActiveWeek] = useState(0);
    const { id } = useParams();
    const challengeId = Array.isArray(id) ? id[0] : (id as string);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const { data: challengeResponse } = useApiGet<{ status: string; message: RawChallenge }>(
        ['challenges', challengeId],
        `/api/challenges/challenges/${challengeId}`,
        { suspense: true },
    );
    const rawChallenge = challengeResponse?.message;
    const challenge = rawChallenge ? transformChallenge(rawChallenge) : null;
    const { data: progressResponse, refetch: refetchProgress } = useApiGet<{
        status: string;
        message: ChallengeProgress;
    }>(
        ['challengeProgress', challengeId],
        `/api/challenges/challenges/progress?challenge_id=${challengeId}`,
    );

    const progressData: ChallengeProgress | null = progressResponse?.message || null;

    useEffect(() => {
        if (selectedDay !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [selectedDay]);

    if (!challenge) return null;

    const isDayCompleted = (sequenceDay: number): boolean => {
        if (!progressData) return false;
        return !!progressData.days!.find((d) => d.sequence_day === sequenceDay && d.is_completed);
    };

    return (
        <div className="flex flex-col min-h-screen bg-white pb-[13%]">
            {selectedDay !== null && rawChallenge?.workout_schedule?.[selectedDay] && (
                <div className="fixed inset-0 z-50 bg-white">
                    <ChallengeDayViewer
                        challengeId={challengeId}
                        challengeName={rawChallenge.name}
                        imageUrl={challenge.image}
                        level={challenge.difficulty}
                        exercises={rawChallenge.workout_schedule[selectedDay].exercises || []}
                        sequenceDay={selectedDay + 1}
                        onClose={() => {
                            setSelectedDay(null);
                            refetchProgress();
                        }}
                    />
                </div>
            )}

            {selectedDay === null && (
                <>
                    <div className="relative w-full h-[30vh]">
                        <Image
                            src={challenge.image}
                            alt="Challenge"
                            layout="fill"
                            objectFit="cover"
                            className="rounded-b-3xl"
                        />
                        <div className="absolute top-8 lg:top-32 left-8">
                            <button
                                onClick={() => router.back()}
                                className="text-white p-2 bg-black bg-opacity-50 rounded-full"
                            >
                                <FaArrowLeft />
                            </button>
                        </div>
                        <div className="absolute bottom-4 left-4 text-white drop-shadow-xl space-y-4">
                            <h1 className="text-3xl font-bold">{challenge.title}</h1>
                            <p className="text-base">{challenge.description}</p>
                        </div>
                    </div>

                    <div className="px-6 py-8 flex flex-row justify-evenly text-2xl font-medium text-gray-700">
                        <span>
                            {challenge.days} {t('workouts.challenges.days')}
                        </span>
                        <span className="flex items-center gap-1 capitalize">
                            <FaFire className="text-red-500" /> {challenge.difficulty}
                        </span>
                        {challenge.equipment && (
                            <span className="flex items-center gap-1">
                                <FaDumbbell /> {t('workouts.challenges.equipment')}
                            </span>
                        )}
                    </div>

                    <div className="h-[13%] fixed bottom-0 left-0 right-0 flex justify-center items-center z-10 bg-white shadow-lg rounded-t-3xl">
                        <button
                            onClick={() => {
                                if (!progressData) {
                                    setSelectedDay(0);
                                    return;
                                }

                                const inProgressDay = progressData.days!.find(
                                    (d) => d.status === 'in_progress',
                                );

                                if (inProgressDay) {
                                    setSelectedDay(inProgressDay.sequence_day - 1);
                                    return;
                                }

                                const completedDays = progressData
                                    .days!.filter((d) => d.is_completed)
                                    .map((d) => d.sequence_day);

                                if (completedDays.length === 0) {
                                    setSelectedDay(0);
                                    return;
                                }

                                const maxCompleted = Math.max(...completedDays);
                                const nextSequence = maxCompleted + 1;

                                const totalDays = challenge.days;
                                const normalizedNext =
                                    nextSequence > totalDays ? totalDays : nextSequence;

                                setSelectedDay(normalizedNext - 1);
                            }}
                            className="bg-gradient-to-r from-emerald-400 to-emerald-600 w-[90%] text-white px-6 py-6 rounded-full text-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                        >
                            {!progressData
                                ? t('workouts.challenges.startChallenge')
                                : t('workouts.challenges.continueChallenge')}
                        </button>
                    </div>

                    <div className="py-6">
                        <h2 className="ml-6">{t('workouts.challenges.schedule')}</h2>
                        <div className="overflow-x-auto px-6 flex space-x-4 py-4">
                            {challenge.schedule.map((week, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveWeek(index)}
                                    className={`px-4 py-2 rounded-lg border text-base whitespace-nowrap ${
                                        activeWeek === index
                                            ? 'bg-emerald-100 text-emerald-700 font-semibold'
                                            : 'text-gray-600'
                                    }`}
                                >
                                    {t('workouts.challenges.week')} {week.week}
                                </button>
                            ))}
                        </div>

                        <div className="px-6 pt-4 space-y-4 pb-[10vh]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeWeek}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4"
                                >
                                    {challenge.schedule[activeWeek].days.map((day, idx) => {
                                        const dayIndex = activeWeek * 7 + idx;
                                        const rawDay = rawChallenge?.workout_schedule?.[dayIndex];

                                        if (!rawDay) {
                                            return (
                                                <div
                                                    key={idx}
                                                    className="flex items-center border rounded-2xl bg-gray-50 overflow-hidden"
                                                >
                                                    <div className="flex-1 px-4 py-4">
                                                        <p className="text-gray-500 font-medium text-center">
                                                            {t('workouts.challenges.day')} {idx + 1}{' '}
                                                            • {t('workouts.challenges.rest')}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        const seq = rawDay.sequence_day;
                                        const completed = isDayCompleted(seq);

                                        return (
                                            <div
                                                key={idx}
                                                className="relative flex items-center border rounded-2xl bg-gray-50 overflow-hidden cursor-pointer"
                                                onClick={() => {
                                                    if (!day.rest && !completed)
                                                        setSelectedDay(dayIndex);
                                                }}
                                            >
                                                <div className="flex-1 px-4 py-4">
                                                    <div className="flex flex-row items-stretch overflow-hidden rounded-2xl">
                                                        <div
                                                            className={`w-20 flex items-center justify-center text-3xl font-bold ${
                                                                completed
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : 'bg-gray-300 text-gray-700'
                                                            } rounded-2xl`}
                                                        >
                                                            {completed ? (
                                                                <FaCheckCircle className="text-emerald-700 text-2xl" />
                                                            ) : (
                                                                seq
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col justify-center px-4 py-4">
                                                            <p className="text-gray-700 font-semibold">
                                                                {t('workouts.challenges.day')}{' '}
                                                                {idx + 1} • {day.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {t('workouts.challenges.workout')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default React.memo(ChallengeDetailPage);
