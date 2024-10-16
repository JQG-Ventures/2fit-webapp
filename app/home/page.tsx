'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import GreetingSection from '../_components/_sections/GreetingSection';
import SearchBar from '../_components/searchbar/SearchBarComponent';
import ExerciseBannerSection from '../_components/_sections/ExerciseBannerSection';
import GuidedWorkoutsSection from '../_components/_sections/GuidedWorkoutsSection';
import MotivationSection from '../_components/_sections/MotivationSection';
import WorkoutLibrarySection from '../_components/_sections/WorkoutLibraryWidgetSection';
import SavedWorkoutsSection from '../_components/_sections/SavedWorkoutsSection';
import Footer from '../_components/_sections/Footer';
import LoadingScreen from '../_components/animations/LoadingScreen';
import { 
    getSavedWorkoutPlansByUser, 
    getWorkoutPlans, 
    getGuidedWorkouts,
    getLibraryWorkoutCount, 
    deleteUserSavedWorkout 
} from '../_services/workoutService';
import { useTranslation } from 'react-i18next';


const HomePage: React.FC = () => {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User>({ userId: '', userName: 'Loading', hasRoutine: false });
    const [isDesktopOrLaptop, setIsDesktopOrLaptop] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [navbarHeight, setNavbarHeight] = useState<number>(100); // State for navbar height
    const { t } = useTranslation('global');

    useEffect(() => {
        const handleResize = () => {
            setIsDesktopOrLaptop(window.innerWidth >= 1224);
            setIsMobile(window.innerWidth < 1224);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
    const [savedWorkoutPlans, setSavedWorkoutPlans] = useState<WorkoutPlan[]>([]);
    const [libraryWorkouts, setLibraryWorkouts] = useState<any[]>([]);
    const [guidedWorkouts, setGuidedWorkouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'loading') {
            setUser({ userId: 'gues_id', userName: 'Loading', hasRoutine: false });
        } else if (status === 'authenticated' && session?.user?.userName && session?.user?.userId) {
            setUser({ userId: session.user.userId, userName: session.user.userName, hasRoutine: true });
        } else {
            setUser({ userId: 'gues_id', userName: 'Guest', hasRoutine: false });
        }
    }, [session, status]);

    useEffect(() => {
        const handleResize = () => {
            const isDesktop = window.innerWidth >= 1224;
            setIsDesktopOrLaptop(isDesktop);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (user.userName === 'Loading') return;

            try {
                setLoading(true);
                const [workoutPlansData, savedWorkoutsData, libraryWorkoutsData, guidedWorkoutsData] = await Promise.all([
                    getWorkoutPlans(),
                    getSavedWorkoutPlansByUser(user.userId), 
                    getLibraryWorkoutCount(),
                    getGuidedWorkouts()
                ]);

                setWorkoutPlans(workoutPlansData.message || []);
                setSavedWorkoutPlans(savedWorkoutsData.message || []);
                setLibraryWorkouts(libraryWorkoutsData.message || []);
                setGuidedWorkouts(guidedWorkoutsData.message || []);
            } catch {
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const renderMessage = (message: string) => (
        <div className="flex justify-center items-center h-48">
            <p>{message}</p>
        </div>
    );

    const paddingBottom = isDesktopOrLaptop ? 0 : navbarHeight * 1.1;

    if (loading) return <LoadingScreen />;

    return (
        <div className="home-page-container bg-white space-y-12 pt-10" style={{ paddingBottom }}>
            <div className="flex flex-col lg:flex-row lg:space-x-8">
                <div className="flex-1">
                    <GreetingSection userName={user.userName} />
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
                {error ? (
                    renderMessage(error)
                ) : (
                    <>
                        <ExerciseBannerSection 
                            hasRoutine={user.hasRoutine} 
                            exercises={workoutPlans} 
                            savedWorkoutPlans={savedWorkoutPlans} 
                        />
                        {!isDesktopOrLaptop && <MotivationSection isBotUser={user.hasRoutine} />}
                        <GuidedWorkoutsSection workouts={guidedWorkouts} />
                        <WorkoutLibrarySection workouts={libraryWorkouts} />
                        <SavedWorkoutsSection
                            workouts={savedWorkoutPlans}
                            deleteWorkout={deleteUserSavedWorkout}
                            emptyMessage={t('home.SavedWorkoutsSection.SavedWorkoutsSectiondescription')}
                            sectionTitle={t('home.SavedWorkoutsSection.SavedWorkoutsSectiontitle')}
                        />
                    </>
                )}
                {isDesktopOrLaptop && <Footer />}
            </div>
        </div>
    );
};

export default HomePage;
