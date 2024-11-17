'use client';

import React, { useState, useEffect } from 'react';
import { useApiGet, useApiDelete } from '../utils/apiClient';
import GreetingSection from '../_components/_sections/GreetingSection';
import SearchBar from '../_components/searchbar/SearchBarComponent';
import ExerciseBannerSection from '../_components/_sections/ExerciseBannerSection';
import MotivationSection from '../_components/_sections/MotivationSection';
import WorkoutLibrarySection from '../_components/_sections/WorkoutLibraryWidgetSection';
import SavedWorkoutsSection from '../_components/_sections/SavedWorkoutsSection';
import Footer from '../_components/_sections/Footer';
import LoadingScreen from '../_components/animations/LoadingScreen';
import { useSessionContext } from '../_providers/SessionProvider';
import { useTranslation } from 'react-i18next';
import { useDeleteWorkout } from '../_services/userService';

const HomePage: React.FC = () => {
    const { t } = useTranslation('global');
    const { userId, userName, loading: sessionLoading } = useSessionContext();
    const [isDesktopOrLaptop, setIsDesktopOrLaptop] = useState(false);
    const { mutate: deleteSavedWorkout } = useDeleteWorkout();

    useEffect(() => {
        const handleResize = () => setIsDesktopOrLaptop(window.innerWidth >= 1224);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const workoutPlansUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/plans/one-day`;
    const savedWorkoutPlansUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/saved`;
    const libraryWorkoutCountUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/library`;

    const { data: workoutPlans, isLoading: loadingWorkoutPlans, isError: workoutPlansError } =
        useApiGet<{ status: string; message: [] }>(['workoutPlans'], workoutPlansUrl, { enabled: !sessionLoading });
    const { data: savedWorkoutPlans, isLoading: loadingSavedWorkoutPlans, isError: savedWorkoutPlansError } =
        useApiGet<{ status: string; message: [] }>(['savedWorkoutPlans'], savedWorkoutPlansUrl, { enabled: !!userId && !sessionLoading });
    const { data: libraryWorkouts, isLoading: loadingLibraryWorkouts, isError: libraryWorkoutsError } =
        useApiGet<{ status: string; message: [] }>(['libraryWorkouts'], libraryWorkoutCountUrl, { enabled: !sessionLoading });

    const handleDeleteWorkout = async (id: string) => {
        deleteSavedWorkout(
            { queryParams: { workout_id: id } },
            {
                onSuccess: (data) =>  {
                    console.log(data);
                },
                onError: (error) => {
                    console.log(error);
                }
            }
        );
    };

    // const guidedWorkoutsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/guided`;
    // const { data: guidedWorkouts, loading: loadingGuidedWorkouts, error: guidedWorkoutsError } = useFetch(guidedWorkoutsUrl, options);

    const loading = loadingWorkoutPlans || loadingSavedWorkoutPlans || loadingLibraryWorkouts || sessionLoading;
    const error = workoutPlansError || savedWorkoutPlansError || libraryWorkoutsError;

    const paddingBottom = isDesktopOrLaptop ? 0 : 100 * 1.1;

    if (loading) return <LoadingScreen />;
    if (error) {
        return (
            <div className="flex justify-center items-center h-48">
                <p>Error: {t("home.error")}</p>
            </div>
        );
    }

    return (
        <div className="home-page-container bg-white space-y-12 pt-10" style={{ paddingBottom }}>
            <div className="flex flex-col lg:flex-row lg:space-x-8">
                <div className="flex-1">
                    <GreetingSection userName={userName || 'Guest'} />
                </div>
                {isDesktopOrLaptop && (
                    <div className="flex flex-col flex-1 mt-16 pt-10">
                        <div className="flex-grow" />
                        <MotivationSection isBotUser={!!userId} />
                    </div>
                )}
            </div>
            {!isDesktopOrLaptop && <SearchBar />}
            <div className="space-y-12">
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
    );
};

export default HomePage;
