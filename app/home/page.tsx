'use client';

import React from 'react';
import GreetingSection from '../_sections/GreetingSection';
import SearchBar from '../_components/searchbar/SearchBarComponent';
import ExerciseBannerSection from '../_sections/ExerciseBannerSection';
import GuidedWorkoutsSection from '../_sections/GuidedWorkoutsSection';
import MotivationSection from '../_sections/MotivationSection';
import WorkoutLibrarySection from '../_sections/WorkoutLibraryWidgetSection';
import SavedWorkoutsSection from '../_sections/SavedWorkoutsSection';
import { useMediaQuery } from 'react-responsive';
import Footer from '../_sections/Footer';


const HomePage = () => {
    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' });
    const isMobile = useMediaQuery({ query: '(max-width: 1224px)' });
    const user = { name: 'John Smith', hasRoutine: true };
    
    const exercises = [
        { name: 'Strength and Conditioning Circuit', image: '/images/homeBanner/banner1.jpg' },
        { name: 'Cardio for the heart', image: '/images/homeBanner/banner2.jpg' },
        { name: 'High Intensity Interval Training', image: '/images/homeBanner/banner3.jpg' }
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

    const savedWorkouts = [
        { title: 'Arms Killer Workout', image: '/images/guidedBanner/banner1.jpg' },
        { title: 'Leg Day Domination', image: '/images/guidedBanner/banner2.jpg' },
        { title: 'Core Strength Builder', image: '/images/guidedBanner/banner3.jpg' },
        { title: 'Arms Killer Workout', image: '/images/guidedBanner/banner1.jpg' },
        { title: 'Leg Day Domination', image: '/images/guidedBanner/banner2.jpg' },
        { title: 'Arms Killer Workout', image: '/images/guidedBanner/banner1.jpg' },
        { title: 'Leg Day Domination', image: '/images/guidedBanner/banner2.jpg' },
        { title: 'Core Strength Builder', image: '/images/guidedBanner/banner3.jpg' },
        { title: 'Core Strength Builder', image: '/images/guidedBanner/banner3.jpg' }
    ];


    return (
        <div className="home-page-container bg-white space-y-12 pt-10"> {/* Adjusted the bottom padding */}
            <div className="flex flex-col lg:flex-row lg:space-x-8"> {/* Use flex-row for larger screens */}
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
                <ExerciseBannerSection hasRoutine={user.hasRoutine} exercises={exercises} />
                {!isDesktopOrLaptop && <MotivationSection isBotUser={true}/>}
                <GuidedWorkoutsSection workouts={workouts} />
                <WorkoutLibrarySection workouts={libraryWorkouts}/>
                <SavedWorkoutsSection workouts={savedWorkouts} />
            </div>
            <Footer />
        </div>
    );
};

export default HomePage;
