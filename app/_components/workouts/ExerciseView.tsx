'use client';

import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ExerciseView = ({ exercise, onNext, onBack }) => {
  if (!exercise) {
    return null;
  }

  const { t } = useTranslation('global');
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white">
      <div className="relative h-[50%] w-full overflow-hidden">
        <img
          src={exercise.image_url}
          alt={exercise.name}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col justify-evenly items-center h-[40%] my-6">
        <h2 className="text-center text-5xl font-bold">{exercise.name}</h2>
        <p className="text-lg mt-2">
          Set {exercise.currentSet} of {exercise.totalSets}
        </p>
        <CountdownCircleTimer
          isPlaying={!isPaused}
          duration={exercise.duration || 60}
          size={180}
          strokeWidth={16}
          colors={['#34D399', '#10B981', '#059669', '#047857']}
          colorsTime={[7, 5, 2, 0]}
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
          onClick={() => setIsPaused((prev) => !prev)}
          className={`border border-green-500 w-full py-4 rounded-full font-semibold transition-all duration-300 ease-in-out ${
            isPaused
              ? 'text-green-500 hover:bg-green-500 hover:text-white'
              : 'text-white bg-green-500 hover:bg-green-400'
          }`}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>
      <div className="flex flex-row justify-evenly w-full h-[10%] items-center">
        <button
          className="w-[40%] flex items-center justify-center bg-green-100 hover:bg-green-200 text-black font-bold px-12 py-4 rounded-full shadow-lg transition duration-300 ease-in-out"
          onClick={onBack}
        >
          <FaArrowLeft className="text-xl mr-2" />
          <span className="text-xl">Previous</span>
        </button>
        <button
          className="w-[40%] flex items-center justify-center bg-green-100 hover:bg-green-200 text-black font-bold px-12 py-4 rounded-full shadow-lg transition duration-300 ease-in-out"
          onClick={onNext}
        >
          <span className="text-xl">Next</span>
          <FaArrowRight className="text-xl ml-2" />
        </button>
      </div>
    </div>
  );
};

export default ExerciseView;
