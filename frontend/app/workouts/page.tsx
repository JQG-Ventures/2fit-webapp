'use client';

import 'swiper/css';
import 'swiper/css/pagination';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../_components/others/ProgressSlider';
import PopularExercisesSection from '../_components/_sections/PopularWorkoutsSection';
import Modal from '../_components/profile/modal';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import './workouts.css';
import { useApiGet } from '../utils/apiClient';
import { useLoading } from '../_providers/LoadingProvider';
import { useSession } from 'next-auth/react';

export default function Workouts() {
    const { t } = useTranslation('global');
    const router = useRouter();
    const { setLoading } = useLoading();

    const [isClicked, setIsClicked] = useState(false);
    const { data: session, status } = useSession();
    // @ts-ignore
    const token = session?.user?.token;

    const sessionLoading = status === 'loading';

    const getActivePlansUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/active-plans`;
    const getPopularWorkoutsUrl = `/api/workouts/popular`;
    const {
        data: activePlansResponse,
        isLoading: loadingActivePlans,
        isError: errorActivePlans,
    } = useApiGet<{ status: string; message: any[] }>(['activePlans'], getActivePlansUrl);
    const {
        data: popularWorkoutResponse,
        isLoading: loadingPopularWorkouts,
        isError: errorPopularWorkouts,
    } = useApiGet<{ status: string; message: any[] }>(['popularWorkouts'], getPopularWorkoutsUrl);

    const [progressData, setProgressData] = useState<any[]>([]);
    const [loadingProgressData, setLoadingProgressData] = useState(true);
    const [errorProgressData, setErrorProgressData] = useState<string | null>(null);
    const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

    useEffect(() => {
        if (sessionLoading || loadingActivePlans || loadingProgressData || loadingPopularWorkouts) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [
        sessionLoading,
        loadingActivePlans,
        loadingProgressData,
        loadingPopularWorkouts,
        setLoading,
    ]);

    useEffect(() => {
        const fetchProgressData = async () => {
            if (!activePlansResponse?.message?.length) {
                setLoadingProgressData(false); // Ensure loading stops when no plans exist
                return;
            }
            setLoadingProgressData(true);

            try {
                const progressPromises = activePlansResponse?.message.map(async (plan) => {
                    const progressUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/workouts/progress?workout_plan_id=${plan.workout_plan_id}`;
                    const response = await fetch(progressUrl, {
                        method: 'GET',
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const jsonData = await response.json();
                    if (!response.ok)
                        console.error(jsonData.message || t('workouts.fetchingError'));
                    return { planId: plan.workout_plan_id, progressData: jsonData.message };
                });

                const progressResults = await Promise.all(progressPromises!);
                const plansWithProgress = activePlansResponse?.message.map((plan) => {
                    const progress = progressResults.find((p) => p.planId === plan.workout_plan_id);
                    return {
                        ...plan,
                        progressData: progress?.progressData || null,
                    };
                });

                setProgressData(plansWithProgress!);
            } catch (error: any) {
                setErrorProgressData(error.message);
            } finally {
                setLoadingProgressData(false);
            }
        };

        fetchProgressData();
    }, [activePlansResponse, t, token]);

    const handleClick = (planId: string) => {
        if (isClicked || loadingPlanId) return;
        setIsClicked(true);
        setLoadingPlanId(planId);
        router.push(`/workouts/my-plan/${planId}`);
    };

    if (errorActivePlans || errorProgressData || errorPopularWorkouts) {
        setLoading(false);
        return (
            <Modal
                title="Error"
                message={errorActivePlans || errorProgressData || t('workouts.fetchingError')}
                onClose={() => router.push('/home')}
            />
        );
    }

    return (
        <div className="flex flex-col h-screen bg-white p-10 items-center lg:pt-[10vh]">
            <div className="h-[10%] flex flex-row justify-left space-x-8 items-center w-full lg:max-w-3xl">
                <button onClick={() => router.back()} className="text-gray-700">
                    <FaArrowLeft className="w-8 h-8" />
                </button>
            </div>

            <Swiper
                id="testing"
                modules={[Pagination]}
                slidesPerView={1}
                pagination={{ clickable: true }}
                className="h-[15vh] w-full overflow-hidden rounded-3xl lg:max-w-3xl"
            >
                {progressData.map((plan: any) => (
                    <SwiperSlide
                        key={plan.workout_plan_id}
                        className="flex justify-center items-center"
                    >
                        <div
                            className={`cursor-pointer flex flex-row justify-center items-center w-full h-full rounded-3xl bg-black px-6 
          								hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                            onClick={() => handleClick(plan.workout_plan_id)}
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
                                {loadingPlanId === plan.workout_plan_id ? (
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
                {!loadingPopularWorkouts && popularWorkoutResponse?.message ? (
                    <PopularExercisesSection workouts={popularWorkoutResponse.message} />
                ) : (
                    <div className="text-gray-500 text-center my-6">{t('workouts.loading')}</div>
                )}
            </div>
        </div>
    );
}
