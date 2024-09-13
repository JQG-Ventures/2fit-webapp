'use client';

import React, { useState, useEffect } from 'react';
import GreetingSection from '../_sections/GreetingSection';
import SearchBar from '../_components/searchbar/SearchBarComponent';
import ExerciseBannerSection from '../_sections/ExerciseBannerSection';
import GuidedWorkoutsSection from '../_sections/GuidedWorkoutsSection';
import MotivationSection from '../_sections/MotivationSection';
import WorkoutLibrarySection from '../_sections/WorkoutLibraryWidgetSection';
import SavedWorkoutsSection from '../_sections/SavedWorkoutsSection';
import Footer from '../_sections/Footer';
import { 
    getSavedWorkoutPlansByUser, 
    getWorkoutPlans, 
    getGuidedWorkouts,
    getLibraryWorkoutCount, 
    deleteUserSavedWorkout 
} from '../_services/workoutService';

interface WorkoutPlan {
    _id: string;
    name: string;
    image_url: string;
}

interface User {
    name: string;
    hasRoutine: boolean;
}

const HomePage: React.FC = () => {
    const [isDesktopOrLaptop, setIsDesktopOrLaptop] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktopOrLaptop(window.innerWidth >= 1224);
            setIsMobile(window.innerWidth < 1224);
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
    const [savedWorkoutPlans, setSavedWorkoutPlans] = useState<WorkoutPlan[]>([]);
    const [libraryWorkouts, setLibraryWorkouts] = useState<any[]>([]);
    const [guidedWorkouts, setGuidedWorkouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const user: User = { name: 'John Smith', hasRoutine: true };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [workoutPlansResponse, savedWorkoutsResponse, libraryWorkouts, guidedWorkouts] = await Promise.all([
                    getWorkoutPlans(),
                    getSavedWorkoutPlansByUser("user_50662633238"),
                    getLibraryWorkoutCount(),
                    getGuidedWorkouts()
                ]);

                console.log(guidedWorkouts  );

                setWorkoutPlans(workoutPlansResponse["message"]);
                setSavedWorkoutPlans(savedWorkoutsResponse["message"]);
                setLibraryWorkouts(libraryWorkouts["message"]);
                setGuidedWorkouts(guidedWorkouts["message"])
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const renderLoading = (message: string) => (
        <div className="flex justify-center items-center h-48">
            <p>{message}</p>
        </div>
    );

    return (
        <div className="home-page-container bg-white space-y-12 pt-10">
            <div className="flex flex-col lg:flex-row lg:space-x-8">
                <div className="flex-1">
                    <GreetingSection userName={user.name} />
                </div>
                {!isMobile && (
                    <div className="flex flex-col flex-1 mt-16 pt-10">
                        <div className="flex-grow"></div>
                        <MotivationSection isBotUser={user.hasRoutine} />
                    </div>

                )}
            </div>
            {!isDesktopOrLaptop && <SearchBar />}
            <div className="space-y-12">
                {loading ? (
                    renderLoading('Loading workout plans and saved workouts...')
                ) : error ? (
                    renderLoading(error)
                ) : (
                    <>
                        <ExerciseBannerSection hasRoutine={user.hasRoutine} exercises={workoutPlans} />
                        {!isDesktopOrLaptop && <MotivationSection isBotUser={user.hasRoutine} />}
                        <GuidedWorkoutsSection workouts={guidedWorkouts} />
                        <WorkoutLibrarySection workouts={libraryWorkouts} />
                        <SavedWorkoutsSection
                            workouts={savedWorkoutPlans}
                            deleteWorkout={deleteUserSavedWorkout}
                            emptyMessage='Exercises that you like will appear here'
                            sectionTitle='Saved Workouts Plans'
                        />
                    </>
                )}
            </div>
            {isDesktopOrLaptop && <Footer />}
        </div>
    );
};

export default HomePage;
