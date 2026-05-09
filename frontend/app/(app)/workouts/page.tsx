'use client';

import 'swiper/css';
import 'swiper/css/pagination';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import ProgressBar from '@/app/_components/others/ProgressSlider';
import PopularExercisesSection from '@/app/_components/_sections/PopularWorkoutsSection';
import Modal from '@/app/_components/profile/modal';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import './workouts.css';
import { useApiGet } from '@/app/utils/apiClient';
import type { ApiResponse } from '@/app/_types/api';
import axiosInstance from '@/app/utils/axiosInstance';
import LoadingScreen from '@/app/_components/animations/LoadingScreen';
import { USER_ACTIVE_PLANS_QUERY_KEY } from '@/app/_constants/queryKeys';
import type { ActiveUserPlan } from '@/app/_types/home';

interface WorkoutProgressSummary {
    progress: number;
    exercises_left?: Exercise[];
}

interface PlanProgressCard {
    id: string;
    plan_type: ActiveUserPlan['plan_type'];
    name: string;
    progressData: WorkoutProgressSummary;
}

export default function Workouts() {
    const { t } = useTranslation('global');
    const router = useRouter();
    const [isClicked, setIsClicked] = useState(false);
    const getActivePlansUrl = `/api/users/active-plans`;
    const getPopularWorkoutsUrl = `/api/workouts/popular`;
    const {
        data: activePlansResponse,
        isLoading: loadingActivePlans,
        isError: errorActivePlans,
    } = useApiGet<ApiResponse<ActiveUserPlan[]>>(USER_ACTIVE_PLANS_QUERY_KEY, getActivePlansUrl);
    const {
        data: popularWorkoutResponse,
        isLoading: loadingPopularWorkouts,
        isError: errorPopularWorkouts,
    } = useApiGet<ApiResponse<WorkoutPlan[]>>(['popularWorkouts'], getPopularWorkoutsUrl);

    const [progressData, setProgressData] = useState<PlanProgressCard[]>([]);
    const [loadingProgressData, setLoadingProgressData] = useState(true);
    const [errorProgressData, setErrorProgressData] = useState<string | null>(null);
    const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchProgressData = async () => {
            if (loadingActivePlans) {
                return;
            }

            const activePlans = activePlansResponse?.message ?? [];

            if (!activePlans.length) {
                if (!cancelled) {
                    setProgressData([]);
                    setErrorProgressData(null);
                    setLoadingProgressData(false);
                }
                return;
            }

            if (!cancelled) {
                setLoadingProgressData(true);
                setErrorProgressData(null);
            }

            try {
                const progressPromises: Promise<PlanProgressCard>[] = activePlans.map(
                    async (plan): Promise<PlanProgressCard> => {
                        if (plan.plan_type === 'challenge') {
                            const response = await axiosInstance.get<
                                ApiResponse<WorkoutProgressSummary>
                            >('/api/challenges/challenges/progress', {
                                params: { challenge_id: plan.id },
                            });
                            return {
                                id: plan.id,
                                plan_type: 'challenge',
                                name: plan.name,
                                progressData: response.data.message,
                            };
                        }

                        const response = await axiosInstance.get<
                            ApiResponse<WorkoutProgressSummary>
                        >('/api/users/workouts/progress', {
                            params: { workout_plan_id: plan.id },
                        });
                        return {
                            id: plan.id,
                            plan_type: plan.plan_type,
                            name: plan.name,
                            progressData: response.data.message,
                        };
                    },
                );

                const progressResults = await Promise.all(progressPromises);
                if (!cancelled) {
                    setProgressData(progressResults);
                }
            } catch (error) {
                if (!cancelled) {
                    setErrorProgressData(
                        error instanceof Error ? error.message : t('workouts.fetchingError'),
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingProgressData(false);
                }
            }
        };

        void fetchProgressData();

        return () => {
            cancelled = true;
        };
    }, [activePlansResponse, loadingActivePlans, t]);

    const handleClick = (planId: string, workoutType: ActiveUserPlan['plan_type']) => {
        if (isClicked || loadingPlanId) return;
        setIsClicked(true);
        setLoadingPlanId(planId);

        if (workoutType === 'personalized') {
            router.push(`/workouts/my-plan/${planId}`);
        } else if (workoutType === 'challenge') {
            router.push(`/workouts/challenges/${planId}`);
        }
    };

    if (loadingActivePlans || loadingPopularWorkouts || loadingProgressData) {
        return <LoadingScreen />;
    }

    if (errorActivePlans || errorProgressData || errorPopularWorkouts) {
        return (
            <Modal
                title="Error"
                message={errorProgressData ?? t('workouts.fetchingError')}
                onClose={() => router.push('/home')}
            />
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-200 p-10 items-center lg:pt-[10vh] space-y-6">
            <div className="h-[10%] flex flex-row justify-left space-x-8 items-center w-full lg:max-w-3xl">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-gray-700"
                    aria-label={t('a11y.goBack')}
                >
                    <FaArrowLeft className="w-8 h-8" />
                </button>
            </div>

            <Swiper
                id="swiper"
                modules={[Pagination]}
                slidesPerView={1}
                pagination={{ clickable: true }}
                className="h-[15vh] w-full overflow-hidden rounded-3xl shadow-xl lg:max-w-3xl"
            >
                {progressData.map((plan) => (
                    <SwiperSlide key={plan.id} className="flex justify-center items-center">
                        <div
                            className={`cursor-pointer flex flex-row justify-center items-center w-full h-full rounded-3xl bg-black px-6 
          								hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                            onClick={() => handleClick(plan.id, plan.plan_type)}
                        >
                            <div className="w-1/2 flex flex-col justify-evenly pr-4">
                                <h2 className="text-white text-3xl font-semibold">
                                    {plan.plan_type === 'personalized'
                                        ? t('workouts.weeklyRoutine')
                                        : plan.plan_type === 'challenge'
                                          ? t('workouts.challengeProgress')
                                          : t('workouts.workoutProgress')}
                                </h2>
                                <span className="text-gray-200 text-2xl">
                                    {plan.progressData?.exercises_left?.length || 0}{' '}
                                    {t('workouts.exercise')}
                                    {plan.progressData?.exercises_left?.length !== 1
                                        ? 's'
                                        : ''}{' '}
                                    {t('workouts.left')}
                                </span>
                            </div>

                            <div className="w-1/2 flex flex-col justify-center text-white">
                                {loadingPlanId === plan.id ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-500"></div>
                                    </div>
                                ) : (
                                    <ProgressBar
                                        percentage={
                                            Number(Math.round(plan.progressData?.progress)) || 0
                                        }
                                    />
                                )}
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <div className="flex flex-row w-full lg:max-w-3xl">
                {popularWorkoutResponse?.message && (
                    <PopularExercisesSection workouts={popularWorkoutResponse.message} />
                )}
            </div>
        </div>
    );
}
