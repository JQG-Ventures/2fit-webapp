import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import LoadingScreen from '../animations/LoadingScreen';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';


interface ExerciseViewProps {
    exercise: Exercise | null;
    onNext: () => void;
    onBack: () => void;
}

const ExerciseView: React.FC<ExerciseViewProps> = ({ exercise, onNext, onBack }) => {
    if (!exercise) {
        return <LoadingScreen />;
    }

    const { t } = useTranslation('global');
    const darkerGreenGradientColors: [string, string, string, string] = ['#34D399', '#10B981', '#059669', '#047857'];
    const countdownSize = 180;
    const countdownStrokeWidth = 16;
    const [isPaused, setIsPaused] = useState(false);

    const splitColorsTime: [number, number, ...number[]] = [
        Math.round((exercise.rest / darkerGreenGradientColors.length) * (darkerGreenGradientColors.length - 1)),
        Math.round((exercise.rest / darkerGreenGradientColors.length) * (darkerGreenGradientColors.length - 2))
    ];

    for (let i = 2; i < darkerGreenGradientColors.length; i++) {
        splitColorsTime.push(Math.round((exercise.rest / darkerGreenGradientColors.length) * (darkerGreenGradientColors.length - i)));
    }

    return (
        <div className='flex flex-col items-center justify-center h-full w-full bg-white rounded-lg shadow-lg lg:pt-[8vh]'>            
            <div className='relative h-[50%] lg:h-[35%] w-full overflow-hidden'>
                <img 
                    src={exercise?.image_url} 
                    alt={exercise?.name} 
                    className="w-full h-full object-contain"
                />
            </div>

            <div className="flex flex-col justify-evenly items-center h-[40%] my-6">
                <h2 className='text-center text-5xl font-bold'>{exercise.name}</h2>
                <CountdownCircleTimer
                    isPlaying={!isPaused}
                    duration={exercise.rest}
                    size={countdownSize}
                    strokeWidth={countdownStrokeWidth}
                    colors={darkerGreenGradientColors}
                    colorsTime={splitColorsTime}
                    trailColor="#E6E6E6"
                    onComplete={() => {
                        onNext();
                        return { shouldRepeat: false };
                    }}
                >
                    {({ remainingTime }) => (
                        <span className="text-4xl font-bold text-black">{remainingTime}</span>
                    )}
                </CountdownCircleTimer>
                <button 
                    onClick={() => setIsPaused(prev => !prev)}
                    className={`border border-green-500 w-full py-4 rounded-full font-semibold transition-all duration-300 ease-in-out 
                                ${isPaused ? 'text-green-500 hover:bg-green-500 hover:text-white' : 'text-white bg-green-500 hover:bg-green-400'}`}
                >
                    {isPaused ? t("workouts.plan.resume") : t("workouts.plan.pause")}
                </button>
            </div>

            <div className="flex flex-row justify-evenly w-full h-[10%] items-center">
                <button
                    className="w-[40%] flex items-center justify-center bg-green-100 hover:bg-green-200 text-black font-bold px-12 py-4 rounded-full shadow-lg transition duration-300 ease-in-out"
                    onClick={onBack}
                >
                    <FaArrowLeft className="text-xl mr-2" />
                    <span className='text-xl'>{t("workouts.plan.previous")}</span>
                </button>
                <button
                    className="w-[40%] flex items-center justify-center bg-green-100 hover:bg-green-200 text-black font-bold px-12 py-4 rounded-full shadow-lg transition duration-300 ease-in-out"
                    onClick={onNext}
                >
                    <span className='text-xl'>{t("workouts.plan.next")}</span>
                    <FaArrowRight className="text-xl ml-2" />
                </button>
            </div>
        </div>
    );
};

export default ExerciseView;
