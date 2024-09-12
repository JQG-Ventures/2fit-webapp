'use client';

import React, { useState, useEffect } from 'react';
import GreetingSection from '../_sections/GreetingSection';
import SearchBar from '../_components/searchbar/SearchBarComponent';
import ExerciseBannerSection from '../_sections/ExerciseBannerSection';
import GuidedWorkoutsSection from '../_sections/GuidedWorkoutsSection';
import MotivationSection from '../_sections/MotivationSection';
import WorkoutLibrarySection from '../_sections/WorkoutLibraryWidgetSection';
import SavedWorkoutsSection from '../_sections/SavedWorkoutsSection';
import { useMediaQuery } from 'react-responsive';
import Footer from '../_sections/Footer';
import { getSavedWorkoutPlansByUser, getWorkoutPlans } from '../_services/workoutService';
import { deleteUserSavedWorkout } from '../_services/workoutService';

const HomePage = () => {
    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' });
    const isMobile = useMediaQuery({ query: '(max-width: 1224px)' });

    const [workoutPlans, setWorkoutPlans] = useState([]);
    const [savedWorkoutPlans, setSavedWorkoutPlans] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const user = { name: 'John Smith', hasRoutine: true };

    const exercises = [
        { _id: '', name: 'Strength and Conditioning Circuit', image_url: '/images/homeBanner/banner1.jpg' },
        { _id: '', name: 'Cardio for the heart', image_url: '/images/homeBanner/banner2.jpg' },
        { _id: '', name: 'High Intensity Interval Training', image_url: '/images/homeBanner/banner3.jpg' }
    ];

    const workouts = [
        { title: 'Arms Killer Workout', image: '/images/guidedBanner/banner1.jpg', muscles: ['Biceps', 'Forearm', 'Triceps'] },
        { title: 'Leg Day Domination', image: '/images/guidedBanner/banner2.jpg', muscles: ['Lats', 'Biceps', 'Upper-Back'] },
        { title: 'Core Strength Builder', image: '/images/guidedBanner/banner3.jpg', muscles: ['Full-Body', 'Abs', 'Legs'] }
    ];

    const libraryWorkouts = [
        { title: 'Arms Killer Workout', workoutCount: 200, description: "Text here that needs to be changed for better look", image: '/images/guidedBanner/banner1.jpg' },
        { title: 'Arms Killer Workout', workoutCount: 200, description: "Text here that needs to be changed for better look", image: '/images/guidedBanner/banner2.jpg' },
        { title: 'Arms Killer Workout', workoutCount: 200, description: "Text here that needs to be changed for better look", image: '/images/guidedBanner/banner3.jpg' },
        { title: 'Arms Killer Workout', workoutCount: 200, description: "Text here that needs to be changed for better look", image: '/images/guidedBanner/banner1.jpg' },
        { title: 'Arms Killer Workout', workoutCount: 200, description: "Text here that needs to be changed for better look", image: '/images/guidedBanner/banner2.jpg' },
        { title: 'Arms Killer Workout', workoutCount: 200, description: "Text here that needs to be changed for better look", image: '/images/guidedBanner/banner3.jpg' },
    ];

    useEffect(() => {
        const fetchWorkoutPlans = async () => {
            try {
                setLoading(true);
                const response = await getWorkoutPlans();
                console.log(response["message"]);
                setWorkoutPlans(response["message"]);
            } catch (error) {
                console.error('Error fetching workout plans:', error);
                setError('Failed to load workout plans');
            } finally {
                setLoading(false);
            }
        };

        fetchWorkoutPlans();
    }, []);

    // // Get Saved Workouts of user
    // useEffect(() => {
    //     const fetchSavedWorkouts = async () => {
    //         try {
    //             setLoading(true);
    //             const response = await getSavedWorkoutPlansByUser("user_50662633238");
    //             setSavedWorkoutPlans(response["message"]);
    //         } catch (error) {
    //             console.error('Error fetching saved workouts:', error);
    //             setError('Failed to load saved workouts');
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchSavedWorkouts();
    // }, []);

    return (
        <div className="home-page-container bg-white space-y-12 pt-10">
            <div className="flex flex-col lg:flex-row lg:space-x-8">
                <div className="flex-1">
                    <GreetingSection userName={user.name} />
                </div>
                {!isMobile && (
                    <div className="flex-1 mt-8">
                        <MotivationSection isBotUser={user.hasRoutine} />
                    </div>
                )}
            </div>
            {!isDesktopOrLaptop && <SearchBar />}
            <div className="space-y-12">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <p>Loading workout plans...</p>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-48">
                        <p>{error}</p>
                    </div>
                ) : (
                    <ExerciseBannerSection hasRoutine={user.hasRoutine} exercises={workoutPlans} />
                )}
                {!isDesktopOrLaptop && <MotivationSection isBotUser={true} />}
                <GuidedWorkoutsSection workouts={workouts} />
                <WorkoutLibrarySection workouts={libraryWorkouts} />
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <p>Loading saved workouts...</p>
                        {/* Replace with a spinner or loading animation */}
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-48">
                        <p>{error}</p>
                    </div>
                ) : (
                    <SavedWorkoutsSection 
                        workouts={exercises} 
                        deleteWorkout={deleteUserSavedWorkout}
                        emptyMessage='Exercises that you like will appear here'
                        sectionTitle='Saved Workouts Plans'
                    />
                )}
                
            </div>
            <Footer />
        </div>
    );
};

export default HomePage;
