'use client';

import { FiVolume2, FiVolumeX, FiX } from 'react-icons/fi';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BottomSheet from '@/app/_components/modals/ExpandableBottomSheet';
import type { WorkoutFlowExercise } from '@/app/_types/workoutProgress';

interface ExerciseViewProp {
    exercise: WorkoutFlowExercise & { currentSet?: number; totalSets?: number };
    onNext: () => void;
    onBack: () => void;
    currentExerciseIndex: number;
    exercises: WorkoutFlowExercise[];
    currentSet: number;
}

const ExerciseView: React.FC<ExerciseViewProp> = ({
    exercise,
    onNext,
    onBack,
    currentExerciseIndex,
    exercises,
    currentSet,
}) => {
    const { t } = useTranslation('global');
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    if (!exercise) return null;
    const exerciseName = exercise.name ?? t('workouts.my-plan.notAvailable');

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <div className="flex h-full w-full flex-col bg-[#f8faf9]">
            <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-5 pt-[calc(1.25rem+env(safe-area-inset-top))]">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg backdrop-blur transition-colors hover:bg-white"
                    aria-label={t('a11y.exitWorkout')}
                >
                    <FiX className="h-6 w-6" />
                </button>
                <div className="mx-3 min-w-0 rounded-full bg-white/90 px-5 py-3 text-center shadow-lg backdrop-blur">
                    <h2 className="max-w-[14rem] truncate text-[1.05rem] font-semibold text-gray-950">
                        {exerciseName}
                    </h2>
                    <p className="text-sm font-medium text-gray-500">
                        Set {exercise.currentSet} {t('workouts.plan.of')} {exercise.totalSets}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={toggleMute}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg backdrop-blur transition-colors hover:bg-white"
                    aria-label={isMuted ? t('a11y.unmuteVideo') : t('a11y.muteVideo')}
                >
                    {isMuted ? (
                        <FiVolumeX className="h-6 w-6" />
                    ) : (
                        <FiVolume2 className="h-6 w-6" />
                    )}
                </button>
            </div>
            <div className="relative flex h-[72dvh] w-full flex-col items-center justify-center overflow-hidden rounded-b-[2rem] bg-gray-100">
                <video
                    ref={videoRef}
                    src={exercise.video_url ?? undefined}
                    autoPlay
                    loop
                    muted={isMuted}
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/25 to-transparent" />
            </div>
            <BottomSheet
                currentExerciseIndex={currentExerciseIndex}
                currentSet={currentSet}
                exercises={exercises}
                onComplete={onNext}
            />
        </div>
    );
};

export default ExerciseView;
