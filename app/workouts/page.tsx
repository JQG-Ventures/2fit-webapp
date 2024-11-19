'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../_components/others/ProgressSlider';
import PopularExercisesSection from '../_components/_sections/PopularWorkoutsSection';
import { useSessionContext } from '../_providers/SessionProvider';
import LoadingScreen from '../_components/animations/LoadingScreen';
import Modal from '../_components/profile/modal';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './workouts.css';
import { useApiGet } from '../utils/apiClient';

export default function Workouts() {
  const { t } = useTranslation('global');
  const router = useRouter();
  const [isClicked, setIsClicked] = useState(false);
  const { token, loading: sessionLoading } = useSessionContext();

  const getActivePlansUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/active-plans`;
  const { data: activePlansResponse, isLoading: loadingActivePlans, isError: errorActivePlans } =
    useApiGet<{ status: string; message: any[] }>(['activePlans'], getActivePlansUrl);

  const [progressData, setProgressData] = useState<any[]>([]);
  const [loadingProgressData, setLoadingProgressData] = useState(false);
  const [errorProgressData, setErrorProgressData] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      if (activePlansResponse?.message?.length > 0) {
        setLoadingProgressData(true);
        try {
          const progressPromises = activePlansResponse.message.map(async (plan) => {
            const progressUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/workouts/progress?workout_plan_id=${plan.workout_plan_id}`;
            const response = await fetch(progressUrl, {"method": "GET", headers: {"Authorization": `Bearer ${token}`}});
            const jsonData = await response.json();
            if (!response.ok) {
              throw new Error(jsonData.message || t('workouts.fetchingError'));
            }
            return { planId: plan.workout_plan_id, progressData: jsonData.message };
          });

          const progressResults = await Promise.all(progressPromises);
          const plansWithProgress = activePlansResponse.message.map((plan) => {
            const progress = progressResults.find((p) => p.planId === plan.workout_plan_id);
            return {
              ...plan,
              progressData: progress?.progressData || null,
            };
          });

          setProgressData(plansWithProgress);
        } catch (error: any) {
          setErrorProgressData(error.message);
        } finally {
          setLoadingProgressData(false);
        }
      }
    };

    fetchProgressData();
  }, [activePlansResponse, t]);

  const handleClick = (planId: string) => {
    if (isClicked) return;
    setIsClicked(true);
    setTimeout(() => {
      router.push(`/workouts/my-plan/${planId}`);
    }, 300);
  };

  const workouts: WorkoutCardProps[] = [
    {
      title: 'Testing 1',
      workoutCount: 20,
      image: 'https://2fitcontentstorage.blob.core.windows.net/2fit-content/pilates.jpg',
    },
    {
      title: 'Testing 2',
      workoutCount: 13,
      image: 'https://2fitcontentstorage.blob.core.windows.net/2fit-content/pilates.jpg',
    },
    {
      title: 'Testing 3',
      workoutCount: 18,
      image: 'https://2fitcontentstorage.blob.core.windows.net/2fit-content/pilates.jpg',
    },
  ];

  if (sessionLoading || loadingActivePlans || loadingProgressData) {
    return <LoadingScreen />;
  }

  if (errorActivePlans || errorProgressData) {
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
        spaceBetween={50}
        slidesPerView={1}
        pagination={{ clickable: true }}
        className="h-[15%] w-full lg:max-w-3xl"
      >
        {progressData.map((plan: any) => (
          <SwiperSlide key={plan.workout_plan_id}>
            <div
              className={`cursor-pointer flex flex-row justify-center items-center w-full h-full rounded-3xl bg-black p-10 ${
                isClicked ? 'animate-click' : ''
              } hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              onClick={() => handleClick(plan.workout_plan_id)}
            >
              <div className="w-1/2 flex flex-col justify-evenly align-start pr-4">
                <h2 className="text-white text-3xl font-semibold">
                  {plan.plan_type === 'personalized'
                    ? t('workouts.weeklyRoutine')
                    : plan.plan_type === 'challenge'
                    ? t('workouts.challengeProgress')
                    : t('workouts.workoutProgress')}
                </h2>
                <span className="text-gray-200 text-2xl">
                  {plan.progressData?.exercises_left?.length || 0} {t('workouts.exercise')}
                  {plan.progressData?.exercises_left?.length !== 1 ? 's' : ''} {t('workouts.left')}
                </span>
              </div>
              <div className="w-1/2 flex flex-col justify-center align-center text-white">
                <ProgressBar percentage={plan.progressData?.progress || 0} />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="flex flex-row w-full lg:max-w-3xl">
        <PopularExercisesSection workouts={workouts} />
      </div>
    </div>
  );
}
