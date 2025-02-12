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

    const { data: workoutPlans, error: errorWorkoutPlans, isLoading: loadingWorkoutPlans, isError: workoutPlansError } =
        useApiGet<{ status: string; message: [] }>(['workoutPlans'], workoutPlansUrl, { enabled: !sessionLoading });
    const { data: savedWorkoutPlans, error: errorSavedPlans, isLoading: loadingSavedWorkoutPlans, isError: savedWorkoutPlansError } =
        useApiGet<{ status: string; message: [] }>(['savedWorkoutPlans'], savedWorkoutPlansUrl, { enabled: !!userId && !sessionLoading });
    const { data: libraryWorkouts, error: errorLibraryWorkouts, isLoading: loadingLibraryWorkouts, isError: libraryWorkoutsError } =
        useApiGet<{ status: string; message: [] }>(['libraryWorkouts'], libraryWorkoutCountUrl, { enabled: !sessionLoading });

    let isLoading = loadingWorkoutPlans || loadingSavedWorkoutPlans || loadingLibraryWorkouts;

    useEffect(() => {
        if (isLoading) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [isLoading, setLoading])

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

    const error = workoutPlansError || savedWorkoutPlansError || libraryWorkoutsError;
    const detailedError = errorWorkoutPlans || errorSavedPlans || errorLibraryWorkouts;

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
