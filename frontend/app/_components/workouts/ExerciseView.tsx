'use client';

import { FaTimes, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BottomSheet from '../modals/ExpandableBottomSheet';

interface ExerciseViewProp {
    exercise: ExerciseView;
    onNext: () => void;
    onBack: () => void;
    currentExerciseIndex: number;
    exercises: Exercise[];
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

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-white">
            <div className="flex flex-row items-center justify-between w-full h-[10%] pt-10 p-6 text-center">
                <button
                    type="button"
                    onClick={onBack}
                    className="p-6 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-500 transition-all"
                    aria-label={t('a11y.exitWorkout')}
                >
                    <FaTimes className="text-2xl" />
                </button>
                <div>
                    <h2 className="text-4xl font-bold">{exercise.name}</h2>
                    <p className="text-lg mt-2">
                        Set {exercise.currentSet} {t('workouts.plan.of')} {exercise.totalSets}
                    </p>
                </div>
                <button
                    onClick={toggleMute}
                    className="p-6 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-500 transition-all"
                >
                    {isMuted ? (
                        <FaVolumeMute className="text-2xl" />
                    ) : (
                        <FaVolumeUp className="text-2xl" />
                    )}
                </button>
            </div>
            <div className="flex flex-col h-[80%] w-full overflow-hidden items-center justify-center">
                <video
                    ref={videoRef}
                    src={exercise.video_url}
                    autoPlay
                    loop
                    muted={isMuted}
                    className="object-cover w-full"
                />
                <button
                    type="button"
                    onClick={toggleMute}
                    className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-full shadow-lg hover:bg-opacity-75 transition"
                    aria-label={isMuted ? t('a11y.unmuteVideo') : t('a11y.muteVideo')}
                >
                    {isMuted ? (
                        <FaVolumeMute className="text-xl" />
                    ) : (
                        <FaVolumeUp className="text-xl" />
                    )}
                </button>
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
