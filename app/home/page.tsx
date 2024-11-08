'use client';

import { deleteUserSavedWorkout } from '../_services/workoutService';
import React, { useState, useEffect, useMemo } from 'react';
import GreetingSection from '../_components/_sections/GreetingSection';
import SearchBar from '../_components/searchbar/SearchBarComponent';
import ExerciseBannerSection from '../_components/_sections/ExerciseBannerSection';
import GuidedWorkoutsSection from '../_components/_sections/GuidedWorkoutsSection';
import MotivationSection from '../_components/_sections/MotivationSection';
import WorkoutLibrarySection from '../_components/_sections/WorkoutLibraryWidgetSection';
import SavedWorkoutsSection from '../_components/_sections/SavedWorkoutsSection';
import Footer from '../_components/_sections/Footer';
import LoadingScreen from '../_components/animations/LoadingScreen';
import { useSessionContext } from '../_providers/SessionProvider';
import { useFetch } from '../_hooks/useFetch';
import { useTranslation } from 'react-i18next';

const HomePage: React.FC = () => {
    const { userId, token, userName, loading: sessionLoading } = useSessionContext();
    const [user, setUser] = useState({ userId: '', userName: 'Loading...', hasRoutine: false });
    const [isDesktopOrLaptop, setIsDesktopOrLaptop] = useState(false);
    const [navbarHeight, setNavbarHeight] = useState<number>(100);
    const { t } = useTranslation('global');

    useEffect(() => {
        const handleResize = () => {
            setIsDesktopOrLaptop(window.innerWidth >= 1224);
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!sessionLoading) {
            setUser(userId ? { userId, userName: userName ?? '', hasRoutine: true } : { userId: 'guest_id', userName: 'Guest', hasRoutine: false });
        }
    }, [userId, userName, sessionLoading]);

    const options = useMemo(() => ({
        method: 'GET',
    }), []);
    const workoutPlansUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/plans/one-day`;
    const savedWorkoutPlansUrl = userId ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/saved/${userId}` : '';
    const libraryWorkoutCountUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/library`;
    // const guidedWorkoutsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/guided`;

    const { data: workoutPlans, loading: loadingWorkoutPlans, error: workoutPlansError } = useFetch(workoutPlansUrl, options);
    const { data: savedWorkoutPlans, loading: loadingSavedWorkoutPlans, error: savedWorkoutPlansError } = useFetch(savedWorkoutPlansUrl, options);
    const { data: libraryWorkouts, loading: loadingLibraryWorkouts, error: libraryWorkoutsError } = useFetch(libraryWorkoutCountUrl, options);
    // const { data: guidedWorkouts, loading: loadingGuidedWorkouts, error: guidedWorkoutsError } = useFetch(guidedWorkoutsUrl, options);
    const loading = loadingWorkoutPlans || loadingSavedWorkoutPlans || loadingLibraryWorkouts; //|| loadingGuidedWorkouts;
    const error = workoutPlansError || savedWorkoutPlansError || libraryWorkoutsError; //|| guidedWorkoutsError;

    const paddingBottom = isDesktopOrLaptop ? 0 : navbarHeight * 1.1;

    if (loading) return <LoadingScreen />;

    if (error) {
        return (
            <div className="flex justify-center items-center h-48">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="home-page-container bg-white space-y-12 pt-10" style={{ paddingBottom }}>
            <div className="flex flex-col lg:flex-row lg:space-x-8">
                <div className="flex-1">
                    <GreetingSection userName={user?.userName} />
                </div>
                {isDesktopOrLaptop && (
                    <div className="flex flex-col flex-1 mt-16 pt-10">
                        <div className="flex-grow" />
                        <MotivationSection isBotUser={user.hasRoutine} />
                    </div>
                )}
            </div>
            {!isDesktopOrLaptop && <SearchBar />}
            <div className="space-y-12">
                <ExerciseBannerSection
                    hasRoutine={user.hasRoutine}
                    exercises={workoutPlans || []}
                    savedWorkoutPlans={savedWorkoutPlans || []}
                />
                {!isDesktopOrLaptop && <MotivationSection isBotUser={user.hasRoutine} />}
                {/* <GuidedWorkoutsSection workouts={guidedWorkouts || []} /> */}
                <WorkoutLibrarySection workouts={libraryWorkouts || []} />
                <SavedWorkoutsSection
                    workouts={savedWorkoutPlans || []}
                    deleteWorkout={deleteUserSavedWorkout}
                    emptyMessage={t('home.SavedWorkoutsSection.SavedWorkoutsSectiondescription')}
                    sectionTitle={t('home.SavedWorkoutsSection.SavedWorkoutsSectiontitle')}
                />
                {isDesktopOrLaptop && <Footer />}
            </div>
        </div>
    );
};

export default HomePage;
