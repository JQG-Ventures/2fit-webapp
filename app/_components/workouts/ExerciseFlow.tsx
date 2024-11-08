'use client';

import React, { useState } from 'react';
import CountdownTimer from '../animations/CountdownTimer';
import ExerciseView from './ExerciseView';
import RestView from './RestView';

const ExerciseFlow = ({ exercise, onClose }) => {
  const [currentSet, setCurrentSet] = useState(1);
  const [isRest, setIsRest] = useState(false);
  const [isCountdown, setIsCountdown] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalSets = exercise.sets || 1;
  const restSeconds = exercise.rest_seconds || 60;

  const handleNext = () => {
    if (isRest) {
      if (currentSet < totalSets) {
        setCurrentSet(currentSet + 1);
        setIsRest(false);
      } else {
        setIsCompleted(true);
      }
    } else {
      setIsRest(true);
    }
  };

  const handleBack = () => {
    if (isRest) {
      setIsRest(false);
    } else {
      if (currentSet > 1) {
        setCurrentSet(currentSet - 1);
        setIsRest(true);
      } else {
        onClose();
      }
    }
  };

  if (isCompleted) {
    // TODO: Implement any completion logic here (e.g., API call to save progress)
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center">Exercise Completed!</h2>
          <button
            onClick={onClose}
            className="mt-6 bg-green-500 text-white px-6 py-3 rounded-full"
          >
            Back to Plan
          </button>
        </div>
      </div>
    );
  }

  if (isCountdown) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <CountdownTimer
          title="Get Ready"
          duration={5}
          size={240}
          strokeWidth={28}
          onComplete={() => setIsCountdown(false)}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      {isRest ? (
        <RestView
          restDuration={restSeconds}
          onNext={handleNext}
          onBack={handleBack}
          nextExercise={exercise}
        />
      ) : (
        <ExerciseView
          exercise={{
            ...exercise,
            currentSet: currentSet,
            totalSets: totalSets,
          }}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
    </div>
  );
};

export default ExerciseFlow;
