'use client';

import { useState } from 'react';
import { IoChevronBack } from 'react-icons/io5';
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
    nextExercise: _nextExercise,
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
        <div className="flex flex-col h-full w-full max-w-4xl items-center">
            <div className="h-[15%] w-full p-10 pt-20">
                <button
                    type="button"
                    onClick={onBack}
                    className="text-4xl lg:hidden"
                    aria-label={t('a11y.goBack')}
                >
                    <IoChevronBack />
                </button>
            </div>
            <div className="h-[60%] p-10 flex flex-col justify-between items-center">
                <h2 className="text-center text-5xl font-semibold bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
                    {t('RestView.rest')}
                </h2>

                <div className="flex-1 flex items-center justify-center">
                    <CountdownCircleTimer
                        key={timerKey}
                        isPlaying
                        duration={duration}
                        size={200}
                        strokeWidth={16}
                        colors={['#34D399', '#10B981', '#059669', '#047857']}
                        colorsTime={[duration, duration / 2, duration / 4, 0]}
                        trailColor="#E6E6E6"
                        onComplete={() => {
                            onNext();
                            return { shouldRepeat: false };
                        }}
                    >
                        {({ remainingTime }) => (
                            <span className="text-5xl font-bold text-black">
                                {String(Math.floor(remainingTime / 60)).padStart(2, '0')}:
                                {String(remainingTime % 60).padStart(2, '0')}
                            </span>
                        )}
                    </CountdownCircleTimer>
                </div>
            </div>
            {/*             <div className="fixed bottom-0 left-0 w-full z-50 border rounded-t-3xl">
                <div className="absolute top-[10px] left-1/2 transform -translate-x-1/2 w-24 h-2 bg-gray-300 rounded-full opacity-50 z-10"></div>
                <div className="w-full bg-white rounded-t-3xl shadow-xl px-6 py-10 flex flex-col space-y-8">
                    {nextExercise && (
                        <div className="flex flex-row items-center space-x-4">
                            <div className="relative w-48 h-48 rounded-xl overflow-hidden flex-shrink-0">
                                <Image
                                    src={nextExercise.image_url}
                                    alt={nextExercise.name}
                                    layout="fill"
                                    objectFit="cover"
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 py-4">
                                <h3 className="text-2xl font-semibold leading-tight">
                                    {t('RestView.nextEx')}
                                    <br />
                                    {nextExercise.name}
                                </h3>
                                <p className="text-xl mt-2 text-gray-600">12 reps • Rest 90s</p>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={subtractTime}
                            className="py-4 px-5 rounded-full border border-gray-300 text-xl font-bold shadow-sm"
                        >
                            -5
                        </button>
                        <button
                            onClick={onNext}
                            className="flex-1 mx-4 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white py-6 rounded-full text-xl font-semibold shadow-lg"
                        >
                            {t('RestView.skip')}
                        </button>
                        <button
                            onClick={addTime}
                            className="py-4 px-5 rounded-full border border-gray-300 text-xl font-bold shadow-sm"
                        >
                            +5
                        </button>
                    </div>
                </div>
            </div> */}
            <BottomSheet
                exercises={exercises}
                currentExerciseIndex={currentExerciseIndex}
                currentSet={currentSet}
                isRestView
                onAddTime={addTime}
                onSubtractTime={subtractTime}
                onSkipRest={onNext}
            />
        </div>
    );
};

export default RestView;
