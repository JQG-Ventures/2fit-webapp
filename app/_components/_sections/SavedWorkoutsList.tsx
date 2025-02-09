"use client";

import React, { useState, useEffect } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { CiBookmarkMinus } from "react-icons/ci";
import { CgNotes } from "react-icons/cg";
import { HiMiniSquares2X2 } from "react-icons/hi2";
import DeleteWorkoutModal from "../modals/deleteWorkoutModal";
import { useTranslation } from "react-i18next";
import { useDeleteWorkout } from "@/app/_services/userService";

interface Workout {
  _id: string;
  image_url: string;
  name: string;
  level: string;
  duration?: number;
  workout_schedule: any[];
}

interface SavedWorkoutsModalProps {
  workouts: Workout[];
  onClose: () => void;
  refetchSavedWorkouts: () => void;
}

const calculateTotalDuration = (workout: Workout) => {
  let totalDurationSeconds = 0;

  workout.workout_schedule?.forEach((schedule) => {
    schedule.exercises?.forEach((exercise) => {
      const sets = exercise.sets || 0;
      const restSeconds = exercise.rest_seconds || 0;
      const setDurationSeconds = 120;

      const exerciseDurationSeconds = sets * setDurationSeconds;
      const totalRestBetweenSets = (sets - 1) * restSeconds;

      totalDurationSeconds += exerciseDurationSeconds + totalRestBetweenSets;
    });
  });

  return Math.floor(totalDurationSeconds / 60);
};

const SavedWorkoutsModal: React.FC<SavedWorkoutsModalProps> = ({ workouts, onClose, refetchSavedWorkouts }) => {
  const { t } = useTranslation("global");
  const { mutate: deleteWorkout } = useDeleteWorkout();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [clickedStates, setClickedStates] = useState<{ [key: string]: boolean }>({});
  const [workoutList, setWorkoutList] = useState<Workout[]>(workouts);

  useEffect(() => {
    if (workouts) {
      setWorkoutList(workouts);
      const initialClickedStates = workouts.reduce((acc, workout) => {
        acc[workout._id] = true;
        return acc;
      }, {} as { [key: string]: boolean });
      setClickedStates(initialClickedStates);
    }
  }, [workouts]);

  const handleBookmarkClick = (workout: Workout) => {
    const duration = calculateTotalDuration(workout);
    setSelectedWorkout({ ...workout, duration });
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedWorkout) {
      deleteWorkout(
        { queryParams: { workout_id: selectedWorkout._id } },
        {
          onSuccess: () => {
            setClickedStates((prev) => {
              const updatedStates = { ...prev };
              delete updatedStates[selectedWorkout._id];
              return updatedStates;
            });

            setWorkoutList((prev) => prev.filter(workout => workout._id !== selectedWorkout._id));

            setSelectedWorkout(null);
            setModalOpen(false);

            refetchSavedWorkouts();
          },
          onError: (error) => {
            console.error("Error deleting workout:", error);
          },
        }
      );
    }
  };

  const handleCancelDelete = () => {
    setModalOpen(false);
    setSelectedWorkout(null);
  };

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex justify-center items-center z-50 transform -translate-y-12">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative md:bottom-0 bottom-12">
        <div className="h-[10%] flex flex-row w-full lg:max-w-3xl py-4 px-6">
          <div className="flex flex-row items-center space-x-6">
            <button onClick={onClose} className="flex items-center text-gray-600 hover:text-green-600">
              <FaArrowLeftLong className="h-8 w-8" />
            </button>
            <h2 className="text-4xl font-semibold">{t("SavedWorkoutsSection.SavedWorkoutsSectiontitle")}</h2>
          </div>
          <div className="flex space-x-4 ml-auto">
            <button className="text-black">
              <CgNotes className="h-8 w-8" />
            </button>
            <button className="text-green-600">
              <HiMiniSquares2X2 className="h-8 w-8" />
            </button>
          </div>
        </div>

        <div className="h-[80vh] overflow-y-auto px-3 py-4">
          <div className="grid grid-cols-2 gap-4">
            {workoutList.map((workout) => {
              const totalDurationMinutes = calculateTotalDuration(workout);

              return (
                <div
                  key={workout._id}
                  className="relative bg-white rounded-xl shadow-lg overflow-hidden h-56 max-w-[200px] transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl active:scale-95 cursor-pointer"
                >
                  <img src={workout.image_url} alt={workout.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-2xl font-semibold">{workout.name}</h3>
                    <p className="text-base">
                      {totalDurationMinutes} {t("SavedWorkoutsSection.SavedWorkoutsSectionMinutes")} |{" "}
                      {t(`SavedWorkoutsSection.levels.${workout.level}`)}
                    </p>
                  </div>
                  <button className="absolute bottom-4 right-4 p-2" onClick={() => handleBookmarkClick(workout)}>
                    <div className={`h-12 w-12 flex items-center justify-center rounded-full ${clickedStates[workout._id] ? "bg-white" : "bg-transparent"}`}>
                      <CiBookmarkMinus className={`h-8 w-8 ${clickedStates[workout._id] ? "text-black" : "text-white"}`} />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <DeleteWorkoutModal
          isOpen={modalOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          workout={selectedWorkout}
          isSaved={selectedWorkout ? clickedStates[selectedWorkout._id] : false}
        />
      </div>
    </div>
  );
};

export default SavedWorkoutsModal;
