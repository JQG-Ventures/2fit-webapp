'use client';

import React, { useState, useEffect } from 'react';
import { useApiGet } from '../utils/apiClient';
import GreetingSection from '../_components/_sections/GreetingSection';
import SearchBar from '../_components/searchbar/SearchBarComponent';
import ExerciseBannerSection from '../_components/_sections/ExerciseBannerSection';
import MotivationSection from '../_components/_sections/MotivationSection';
import WorkoutLibrarySection from '../_components/_sections/WorkoutLibraryWidgetSection';
import SavedWorkoutsSection from '../_components/_sections/SavedWorkoutsSection';
import Footer from '../_components/_sections/Footer';
import { useTranslation } from 'react-i18next';
import { useDeleteWorkout } from '../_services/userService';
import { useSession } from 'next-auth/react';
import PendingExerciseCard from '../_components/workouts/my-plan/PendingExerciseCard';
import Link from 'next/link';
import OneSignalInitializer from '../_components/others/OneSignalInitializer';
import { useRouter } from 'next/navigation';
import ChallengeProgressWidget from '../_components/workouts/challenges/ChallengeProgressWidget';

const HomePage: React.FC = () => {
    const { t } = useTranslation('global');
    const { data: session } = useSession();
    const userId = session?.user?.id;
    // @ts-ignore
    const userName = session?.user?.userName;
    const [isDesktopOrLaptop, setIsDesktopOrLaptop] = useState(false);
    const { mutate: deleteSavedWorkout } = useDeleteWorkout();

    useEffect(() => {
        const handleResize = () => setIsDesktopOrLaptop(window.innerWidth >= 1224);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const workoutPlansUrl = `/api/workouts/plans/one-day`;
    const savedWorkoutPlansUrl = `/api/workouts/saved`;
    const libraryWorkoutCountUrl = `/api/workouts/library`;
    const activePlansUrl = `/api/workouts/weekly-progress`;
    const getActivePlansUrl = `/api/users/active-plans`;

    const { data: workoutPlans } = useApiGet<{ status: string; message: [] }>(
        ['workoutPlans'],
        workoutPlansUrl,
    );
    const { data: savedWorkoutPlans } = useApiGet<{ status: string; message: [] }>(
        ['savedWorkoutPlans'],
        savedWorkoutPlansUrl,
    );
    const { data: libraryWorkouts } = useApiGet<{ status: string; message: [] }>(
        ['libraryWorkouts'],
        libraryWorkoutCountUrl,
    );
    const { data: activePlans } = useApiGet<{ status: string; message: {} }>(
        ['activePlans'],
        activePlansUrl,
    );
    const { data: userActivePlans } = useApiGet<{ status: string; message: [] }>(
        ['userActivePlans'],
        getActivePlansUrl,
    );

    const handleDeleteWorkout = async (id: string) => {
        deleteSavedWorkout(
            { queryParams: { workout_id: id } },
            {
                onSuccess: () => {},
                onError: (error) => console.error(error),
            },
        );
    };

    const [challengeProgressData, setChallengeProgressData] = useState<any[]>([]);
    const [loadingChallengeProgress, setLoadingChallengeProgress] = useState(true);
    const [errorChallengeProgress, setErrorChallengeProgress] = useState<string | null>(null);

    useEffect(() => {
        const fetchChallengeProgress = async () => {
            if (!userActivePlans?.message?.length) {
                setLoadingChallengeProgress(false);
                return;
            }
            setLoadingChallengeProgress(true);

            try {
                // @ts-ignore
                const token = session?.user?.token;
                const challengePlans = userActivePlans.message.filter(
                    (plan: any) => plan.plan_type === 'challenge',
                );

                const promises = challengePlans.map(async (plan: any) => {
                    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/challenges/challenges/progress?challenge_id=${plan.id}`;
                    const res = await fetch(url, {
                        method: 'GET',
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const json = await res.json();
                    if (!res.ok) {
                        console.error(json.message || t('workouts.fetchingError'));
                        return null;
                    }
                    return {
                        id: plan.id,
                        plan_type: 'challenge',
                        name: plan.name,
                        progressData: json.message as any,
                    };
                });

                const results = await Promise.all(promises);
                setChallengeProgressData(results);
            } catch (err: any) {
                setErrorChallengeProgress(err.message);
                return null;
            } finally {
                setLoadingChallengeProgress(false);
            }
        };

        fetchChallengeProgress();
    }, [userActivePlans, session, t]);

    // const guidedWorkoutsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/guided`;
    // const { data: guidedWorkouts, loading: loadingGuidedWorkouts, error: guidedWorkoutsError } = useFetch(guidedWorkoutsUrl, options);
    const paddingBottom = isDesktopOrLaptop ? 0 : 100 * 1.1;

    const getTodayPendingExercise = () => {
        // @ts-ignore
        if (!activePlans?.message?.days) return null;

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        // @ts-ignore
        const todayPlan = activePlans.message.days.find((day: any) => day.date === todayStr);

        if (todayPlan) {
            return todayPlan.exercises.find((exercise: any) => !exercise.is_completed);
        }

        return null;
    };

    const todayExercise = getTodayPendingExercise();
    const router = useRouter();

    const handleContinue = (planId: string, planType: string) => {
        if (planType === 'personalized') {
            router.push(`/workouts/my-plan/${planId}`);
        } else if (planType === 'challenge') {
            router.push(`/workouts/challenges/${planId}`);
        }
    };

    return (
        <div className="home-page-container bg-white space-y-12 pt-10" style={{ paddingBottom }}>
            <OneSignalInitializer />
            <div className="flex flex-col lg:flex-row lg:space-x-8">
                <div
                    className={isDesktopOrLaptop ? `flex-1` : 'flex flex-row justify-between pr-6'}
                >
                    <GreetingSection userName={userName || 'Guest'} />

                    {!isDesktopOrLaptop && (
                        <div className="flex justify-end items-center">
                            <SearchBar />
                        </div>
                    )}
                </div>
                {isDesktopOrLaptop && (
                    <div className="flex flex-col flex-1 mt-16 pt-10">
                        <div className="flex-grow" />
                        <MotivationSection isBotUser={!!userId} />
                    </div>
                )}
            </div>

            <div className="space-y-12">
                {todayExercise && (
                    <Link href={`/workouts`} passHref>
                        <PendingExerciseCard
                            exercise={{
                                image_url: todayExercise.image_url,
                                name: todayExercise.name,
                                description: todayExercise.description,
                                difficulty: todayExercise.difficulty,
                            }}
                        />
                    </Link>
                )}
                <ExerciseBannerSection
                    hasRoutine={!!userId}
                    exercises={workoutPlans?.message || []}
                    savedWorkoutPlans={savedWorkoutPlans?.message || []}
                />
                {!isDesktopOrLaptop && <MotivationSection isBotUser={!!userId} />}

                {!loadingChallengeProgress && (
                    <div className="p-4">
                        <ChallengeProgressWidget
                            progressData={challengeProgressData}
                            onContinue={handleContinue}
                        />
                    </div>
                )}
                <WorkoutLibrarySection workouts={libraryWorkouts?.message || []} />
                {/* <GuidedWorkoutsSection workouts={guidedWorkouts || []} /> */}
                <SavedWorkoutsSection
                    workouts={savedWorkoutPlans?.message || []}
                    deleteWorkout={handleDeleteWorkout}
                    emptyMessage={t('home.SavedWorkoutsSection.SavedWorkoutsSectiondescription')}
                    sectionTitle={t('home.SavedWorkoutsSection.SavedWorkoutsSectiontitle')}
                />
                {isDesktopOrLaptop && <Footer />}
            </div>
        </div>
    );
};

export default HomePage;
