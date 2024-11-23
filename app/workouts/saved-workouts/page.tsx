"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeftLong } from "react-icons/fa6";
import { CiBookmarkMinus } from "react-icons/ci";
import { CgNotes } from "react-icons/cg";
import { HiMiniSquares2X2 } from "react-icons/hi2";
import { ImSpinner8 } from "react-icons/im";
import { useApiGet } from "../../utils/apiClient";
import { useDeleteWorkout } from "@/app/_services/userService";
import ConfirmationModal from "../../_components/modals/confirmationModal";

const SavedWorkouts: React.FC = () => {
  const router = useRouter();
  const [clickedStates, setClickedStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null
  );

  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/saved`;

  const { mutate: deleteWorkout } = useDeleteWorkout();

  const {
    data: savedWorkouts,
    isLoading,
    isError,
  } = useApiGet<{ status: string; message: any[] }>(["savedWorkouts"], apiUrl);

  useEffect(() => {
    if (savedWorkouts && savedWorkouts.message) {
      const initialClickedStates = savedWorkouts.message.reduce(
        (acc, workout) => {
          acc[workout._id] = true;
          return acc;
        },
        {} as { [key: string]: boolean }
      );
      setClickedStates(initialClickedStates);
    }
  }, [savedWorkouts]);

  const handleBookmarkClick = (workoutId: string) => {
    setSelectedWorkoutId(workoutId);
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedWorkoutId) {
      deleteWorkout(
        { queryParams: { workout_id: selectedWorkoutId } },
        {
          onSuccess: () => {
            setClickedStates((prev) => {
              const updatedStates = { ...prev };
              delete updatedStates[selectedWorkoutId];
              return updatedStates;
            });
            setModalOpen(false);
            setSelectedWorkoutId(null);
          },
          onError: (error) => {
            console.error("Error deleting workout:", error);
            setModalOpen(false);
            setSelectedWorkoutId(null);
          },
        }
      );
    }
  };

  const handleCancelDelete = () => {
    setModalOpen(false);
    setSelectedWorkoutId(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80%]">
        <ImSpinner8 className="animate-spin h-16 w-16 text-green-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border-dashed p-8 rounded-lg flex justify-center items-center h-[80%]">
        <p className="text-red-500 text-xl">
          Failed to fetch saved workouts. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between items-center bg-white h-screen p-10 lg:pt-[10vh]">
      <div className="h-[10%] flex flex-row justify-between items-center w-full lg:max-w-3xl">
        <div className="flex flex-row items-center space-x-8">
          <button
            onClick={() => router.push("/home")}
            className="flex items-center text-gray-600 hover:text-green-600"
          >
            <FaArrowLeftLong className="h-8 w-8" />
          </button>
          <h2 className="text-4xl font-semibold">My Bookmark</h2>
        </div>
        <div className="flex space-x-4">
          <button className="text-black">
            <CgNotes className="h-8 w-8" />
          </button>
          <button className="text-green-600">
            <HiMiniSquares2X2 className="h-8 w-8" />
          </button>
        </div>
      </div>

      <div className="h-[90%] w-full lg:max-w-3xl overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-y-4 gap-x-4 px-3 items-start">
          {savedWorkouts.message.map((workout, index) => (
            <div
              key={workout._id}
              className={`relative bg-white rounded-lg shadow-lg overflow-hidden h-48 max-w-full transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl active:scale-95 cursor-pointer ${
                index === 0 || index === 1 ? "mt-2" : ""
              }`}
            >
              <img
                src={workout.image_url}
                alt={workout.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-xl font-semibold">{workout.name}</h3>
                <p className="text-sm">
                  {workout.duration_weeks * 7} minutes | {workout.level}
                </p>
              </div>
              <button
                className="absolute bottom-4 right-4 p-2"
                onClick={() => handleBookmarkClick(workout._id)}
              >
                <div
                  className={`h-8 w-8 flex items-center justify-center rounded-full ${
                    clickedStates[workout._id] ? "bg-white" : "bg-transparent"
                  }`}
                >
                  <CiBookmarkMinus
                    className={`h-6 w-6 ${
                      clickedStates[workout._id] ? "text-black" : "text-white"
                    }`}
                  />
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        question="Are you sure you want to remove this workout from your saved list?"
        confirmText="Yes, remove"
        cancelText="Cancel"
      />
    </div>
  );
};

export default SavedWorkouts;
