'use client';

import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import BottomSheet from '@/app/_components/modals/ExpandableBottomSheet';

interface RestViewProp {
    restDuration: number;
    onNext: () => void;
    onBack: () => void;
    nextExercise: Exercise;
    exercises: Exercise[];
    currentExerciseIndex: number;
    currentSet: number;
}

const RestView: React.FC<RestViewProp> = ({
    restDuration,
    onNext,
    onBack,
    nextExercise,
    exercises,
    currentExerciseIndex,
    currentSet,
}) => {
    const { t } = useTranslation('global');
    const [duration, setDuration] = useState(restDuration);
    const [timerKey, setTimerKey] = useState(Date.now());

    const addTime = () => {
        setDuration((prev) => prev + 5);
        setTimerKey(Date.now());
    };

    const subtractTime = () => {
        setDuration((prev) => Math.max(prev - 5, 1));
        setTimerKey(Date.now());
    };

    return (
        <div className="flex h-full w-full flex-col items-center bg-[#f8faf9]">
            <div className="flex w-full max-w-3xl items-center justify-between px-5 pt-[calc(1.25rem+env(safe-area-inset-top))]">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                    aria-label={t('a11y.exitWorkout')}
                >
                    <FiX className="h-6 w-6" />
                </button>
                <span className="rounded-full bg-white px-4 py-2 text-[1.05rem] font-semibold text-gray-600 shadow-sm">
                    Set {currentSet}
                </span>
                <div className="h-12 w-12" />
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center px-5 pb-44 pt-8">
                <div className="flex w-full max-w-md flex-col items-center rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
                    <p className="text-[1.05rem] font-medium text-green-600">
                        {t('RestView.rest')}
                    </p>
                    <h2 className="mt-2 text-center text-[2.25rem] font-semibold text-gray-950">
                        {t('RestView.nextEx')}
                    </h2>
                    <p className="mt-1 max-w-xs truncate text-center text-[1.2rem] text-gray-500">
                        {nextExercise.name}
                    </p>

                    <div className="mt-8 flex items-center justify-center">
                        <CountdownCircleTimer
                            key={timerKey}
                            isPlaying
                            duration={duration}
                            size={220}
                            strokeWidth={14}
                            colors={['#22C55E', '#16A34A', '#15803D', '#166534']}
                            colorsTime={[duration, duration / 2, duration / 4, 0]}
                            trailColor="#F1F5F9"
                            onComplete={() => {
                                onNext();
                                return { shouldRepeat: false };
                            }}
                        >
                            {({ remainingTime }) => (
                                <span className="text-5xl font-semibold text-gray-950">
                                    {String(Math.floor(remainingTime / 60)).padStart(2, '0')}:
                                    {String(remainingTime % 60).padStart(2, '0')}
                                </span>
                            )}
                        </CountdownCircleTimer>
                    </div>
                </div>
            </div>
            <BottomSheet
                exercises={exercises}
                currentExerciseIndex={currentExerciseIndex}
                currentSet={currentSet}
                isRestView
                nextPreviewExercise={nextExercise}
                onAddTime={addTime}
                onSubtractTime={subtractTime}
                onSkipRest={onNext}
            />
        </div>
    );
};

export default RestView;
