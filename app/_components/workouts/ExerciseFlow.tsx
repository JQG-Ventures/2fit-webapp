'use client';

import React, { useState } from 'react';
import CountdownTimer from '../animations/CountdownTimer';
import ExerciseView from '../workouts/ExerciseView';
import RestView from '../workouts/RestView';
import CompleteView from '../workouts/CompleteView';

const ExerciseFlow = ({ exercises, onClose }) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isRest, setIsRest] = useState(false);
  const [isCountdown, setIsCountdown] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [restDuration, setRestDuration] = useState(0);
  const [nextExerciseDetails, setNextExerciseDetails] = useState(null);

  const totalExercises = exercises.length;
  const currentExercise = exercises[currentExerciseIndex];
  const totalSets = currentExercise?.sets || 1;
  const defaultRestSeconds = currentExercise?.rest_seconds || 60;

  const handleNext = () => {
    if (isRest) {
      // After rest period
      if (currentSet < totalSets) {
        // More sets to do
        setCurrentSet(currentSet + 1);
        setIsRest(false);
      } else {
        // Completed all sets of the current exercise
        if (currentExerciseIndex < totalExercises - 1) {
          // More exercises left
          setCurrentExerciseIndex(currentExerciseIndex + 1);
          setCurrentSet(1);
          setIsRest(true);
          setRestDuration(120); // 2 minutes
          setNextExerciseDetails(exercises[currentExerciseIndex + 1]);
        } else {
          // No more exercises
          setIsCompleted(true);
        }
      }
    } else {
      // After exercise period
      if (currentSet < totalSets) {
        // Not the last set, proceed to rest
        setIsRest(true);
        setRestDuration(defaultRestSeconds);
        setNextExerciseDetails(null);
      } else {
        // Completed the last set
        if (currentExerciseIndex < totalExercises - 1) {
          // More exercises left
          setCurrentExerciseIndex(currentExerciseIndex + 1);
          setCurrentSet(1);
          setIsRest(true);
          setRestDuration(120); // 2 minutes
          setNextExerciseDetails(exercises[currentExerciseIndex + 1]);
        } else {
          // No more exercises
          setIsCompleted(true);
        }
      }
    }
  };

  const handleBack = () => {
    if (isRest) {
      // Go back to exercise view
      if (currentSet <= totalSets && currentSet > 1) {
        setIsRest(false);
      } else if (currentSet === 1 && currentExerciseIndex > 0) {
        // Go back to previous exercise
        setCurrentExerciseIndex(currentExerciseIndex - 1);
        const previousExercise = exercises[currentExerciseIndex - 1];
        setCurrentSet(previousExercise.sets);
        setIsRest(true);
        setRestDuration(120); // 2 minutes
        setNextExerciseDetails(currentExercise);
      } else {
        onClose();
      }
    } else {
      if (currentSet > 1) {
        // Go back to previous set
        setCurrentSet(currentSet - 1);
        setIsRest(true);
        setRestDuration(defaultRestSeconds);
        setNextExerciseDetails(null);
      } else if (currentExerciseIndex > 0) {
        // Go back to previous exercise
        setCurrentExerciseIndex(currentExerciseIndex - 1);
        const previousExercise = exercises[currentExerciseIndex - 1];
        setCurrentSet(previousExercise.sets);
        setIsRest(true);
        setRestDuration(120); // 2 minutes
        setNextExerciseDetails(currentExercise);
      } else {
        // First exercise and first set, close the flow
        onClose();
      }
    }
  };

  if (isCompleted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <CompleteView goToPlan="/workouts" />
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
          restDuration={restDuration}
          onNext={handleNext}
          onBack={handleBack}
          nextExercise={nextExerciseDetails}
        />
      ) : (
        <ExerciseView
          exercise={{
            ...currentExercise,
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
