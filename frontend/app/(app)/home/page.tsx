'use client';

import React, { useState } from 'react';
import GreetingSection from '@/app/_components/_sections/GreetingSection';
import MobileTopBar from '@/app/_components/navbar/MobileTopBar';
import WorkoutHeroCard from '@/app/_components/_sections/WorkoutHeroCard';
import MotivationSection from '@/app/_components/_sections/MotivationSection';
import ExploreWorkoutsSection from '@/app/_components/_sections/ExploreWorkoutsSection';
import TrainingLevelsSection from '@/app/_components/_sections/TrainingLevelsSection';
import type { HomeLevelFilter } from '@/app/_types/homeDiscovery';
import SavedWorkoutsSection from '@/app/_components/_sections/SavedWorkoutsSection';
import Footer from '@/app/_components/_sections/Footer';
import OneSignalInitializer from '@/app/_components/others/OneSignalInitializer';
import ChallengeProgressWidget from '@/app/_components/workouts/challenges/ChallengeProgressWidget';
import HomeStatsRow from '@/app/_components/_sections/HomeStatsRow';
import LoadingScreen from '@/app/_components/animations/LoadingScreen';
import { useHomeViewport } from '@/app/(app)/home/_hooks/useHomeViewport';
import { useHomeDashboard } from '@/app/(app)/home/_hooks/useHomeDashboard';
import { HOME_MOBILE_BOTTOM_NAV_PADDING_CLASS } from '@/app/(app)/home/constants';

const HomePage: React.FC = () => {
    const [trainingLevel, setTrainingLevel] = useState<HomeLevelFilter>('all');
    const { mounted, isDesktopOrLaptop } = useHomeViewport();
    const {
        t,
        sessionStatus,
        userId,
        userName,
        savedWorkoutPlans,
        exploreCards,
        byLevelCards,
        loadingExplore,
        loadingByLevel,
        loadingActivePlans,
        loadingUserActivePlans,
        challengeIds,
        challengeProgressData,
        loadingChallengeProgress,
        todayExercise,
        planProgress,
        sessionsThisWeek,
        handleDeleteWorkout,
        handleContinue,
        hasActivePlans,
    } = useHomeDashboard(trainingLevel);

    if (!mounted || sessionStatus === 'loading') return <LoadingScreen />;

    return (
        <div
            className={`home-page-container bg-white space-y-6 ${
                !isDesktopOrLaptop ? HOME_MOBILE_BOTTOM_NAV_PADDING_CLASS : 'pt-10 pb-0'
            }`}
        >
            <OneSignalInitializer />

            {!isDesktopOrLaptop && <MobileTopBar />}

            <div className="flex flex-col lg:flex-row lg:space-x-8">
                <div className={isDesktopOrLaptop ? 'flex-1' : 'w-full'}>
                    <GreetingSection userName={userName} />
                </div>
                {isDesktopOrLaptop && (
                    <div className="flex flex-col flex-1 mt-16 pt-10">
                        <div className="flex-grow" />
                        <MotivationSection isBotUser={!!userId} />
                    </div>
                )}
            </div>

            <div className="space-y-12">
                <WorkoutHeroCard
                    pendingExercise={
                        todayExercise
                            ? {
                                  name: todayExercise.name ?? '',
                                  description: todayExercise.description ?? '',
                                  difficulty: todayExercise.difficulty ?? '',
                                  image_url: todayExercise.image_url ?? '',
                              }
                            : null
                    }
                    planProgress={planProgress}
                    hasPlan={hasActivePlans}
                    isLoading={loadingActivePlans || loadingUserActivePlans}
                />
                <HomeStatsRow
                    streakDays={0}
                    sessionsThisWeek={sessionsThisWeek}
                    totalSessions={0}
                    isLoading={loadingActivePlans}
                />
                {!isDesktopOrLaptop && <MotivationSection isBotUser={!!userId} />}

                {challengeIds.length > 0 && (
                    <div className="px-6 py-6">
                        <ChallengeProgressWidget
                            progressData={challengeProgressData ?? []}
                            onContinue={handleContinue}
                            isLoading={loadingChallengeProgress}
                        />
                    </div>
                )}
                <ExploreWorkoutsSection
                    cards={exploreCards?.message ?? []}
                    isLoading={loadingExplore}
                />
                <TrainingLevelsSection
                    cards={byLevelCards?.message ?? []}
                    isLoading={loadingByLevel}
                    selectedLevel={trainingLevel}
                    onLevelChange={setTrainingLevel}
                />
                <SavedWorkoutsSection
                    workouts={savedWorkoutPlans?.message ?? []}
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
