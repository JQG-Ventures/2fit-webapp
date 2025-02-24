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
import { useLoading } from '../_providers/LoadingProvider';
import Modal from '../_components/profile/modal';
import { useSession } from 'next-auth/react';
import PendingExerciseCard from '../_components/workouts/my-plan/PendingExerciseCard';
import Link from 'next/link';

const HomePage: React.FC = () => {
    const { t } = useTranslation('global');
    const { setLoading } = useLoading();
    const { data: session, status } = useSession();

    const userId = session?.user?.id;
    // @ts-ignore
    const userName = session?.user?.userName;
    const sessionLoading = status === 'loading';
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
    const activePlansUrl = `/api/workouts/weekly-progress`

    const { data: workoutPlans, error: errorWorkoutPlans, isLoading: loadingWorkoutPlans, isError: workoutPlansError } =
        useApiGet<{ status: string; message: [] }>(['workoutPlans'], workoutPlansUrl, { enabled: !sessionLoading });
    const { data: savedWorkoutPlans, error: errorSavedPlans, isLoading: loadingSavedWorkoutPlans, isError: savedWorkoutPlansError } =
        useApiGet<{ status: string; message: [] }>(['savedWorkoutPlans'], savedWorkoutPlansUrl, { enabled: !!userId && !sessionLoading });
    const { data: libraryWorkouts, error: errorLibraryWorkouts, isLoading: loadingLibraryWorkouts, isError: libraryWorkoutsError } =
        useApiGet<{ status: string; message: [] }>(['libraryWorkouts'], libraryWorkoutCountUrl, { enabled: !sessionLoading });
    const { data: activePlans, error: errorActivePlans, isLoading: loadingActivePlans, isError: activePlansError } =
        useApiGet<{ status: string; message: {} }>(['activePlans'], activePlansUrl, { enabled: !sessionLoading });

    let isLoading = loadingWorkoutPlans || loadingSavedWorkoutPlans || loadingLibraryWorkouts || loadingActivePlans;

    useEffect(() => {
        setLoading(isLoading);
    }, [isLoading]);

    const handleDeleteWorkout = async (id: string) => {
        deleteSavedWorkout(
            { queryParams: { workout_id: id } },
            {
                onSuccess: () => { },
                onError: (error) => console.error(error)
            }
        );
    };

    // const guidedWorkoutsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/guided`;
    // const { data: guidedWorkouts, loading: loadingGuidedWorkouts, error: guidedWorkoutsError } = useFetch(guidedWorkoutsUrl, options);

    const error = workoutPlansError || savedWorkoutPlansError || libraryWorkoutsError || activePlansError;
    const detailedError = errorWorkoutPlans || errorSavedPlans || errorLibraryWorkouts || errorActivePlans;

    const paddingBottom = isDesktopOrLaptop ? 0 : 100 * 1.1;

    if (error) {
        if (detailedError!.response?.status === 401 || detailedError!.response?.status === 403) {
            return null;
        }
        return (
            <Modal
                title={t("home.errorTitle")}
                message={t("home.error")}
                onClose={() => { }}
            />
        );
    }

    const getTodayPendingExercise = () => {
        // @ts-ignore
        if (!activePlans?.message?.days) return null;

        const today = new Date().toISOString().split("T")[0];

        // @ts-ignore
        const todayPlan = activePlans.message.days.find((day: any) => day.date === today);

        if (todayPlan) {
            return todayPlan.exercises.find((exercise: any) => !exercise.is_completed);
        }

        return null;
    };


    const todayExercise = getTodayPendingExercise();

    console.log("active plans", activePlans?.message);

    return (
        <Link href={`/workouts`} passHref>
            <div className="home-page-container bg-white space-y-12 pt-10" style={{ paddingBottom }}>
                <div className="flex flex-col lg:flex-row lg:space-x-8">
                    <div className={isDesktopOrLaptop ? `flex-1` : 'flex flex-row justify-between pr-6'}>
                        <GreetingSection userName={userName || 'Guest'} />

                        {!isDesktopOrLaptop &&
                            <div className='flex justify-end items-center'>
                                <SearchBar />
                            </div>
                        }
                    </div>
                    {isDesktopOrLaptop && (
                        <div className="flex flex-col flex-1 mt-16 pt-10">
                            <div className="flex-grow" />
                            <MotivationSection isBotUser={!!userId} />
                        </div>
                    )}
                </div>

                <div className="space-y-12">
                    {todayExercise &&
                        <PendingExerciseCard
                            exercise={{
                                image_url: todayExercise.image_url,
                                name: todayExercise.name,
                                description: todayExercise.description,
                                difficulty: todayExercise.difficulty,
                            }}
                        />
                    }
                    <ExerciseBannerSection
                        hasRoutine={!!userId}
                        exercises={workoutPlans?.message || []}
                        savedWorkoutPlans={savedWorkoutPlans?.message || []}
                    />
                    {!isDesktopOrLaptop && <MotivationSection isBotUser={!!userId} />}
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
        </Link>
    );
};

export default HomePage;
