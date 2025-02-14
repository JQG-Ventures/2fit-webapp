"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface DeleteWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  workout: {
    _id: string;
    image_url: string;
    name: string;
    level: string;
    duration: number;
  } | null;
}

const DeleteWorkoutModal: React.FC<DeleteWorkoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  workout,
}) => {
  const { t } = useTranslation("global");

  if (!isOpen || !workout) return null;

  return (
    <div className="absolute bottom-0 left-0 w-full flex justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white w-full max-w-3xl sm:max-w-3xl rounded-t-[4rem] shadow-lg p-6 relative"
      >
        <h2 className="text-2xl font-semibold text-center mt-6 mb-8">
          {t("home.SavedWorkoutsSection.SavedWorkoutsSectionquestion")}
        </h2>

        <div className="border-t-1 border-gray-200 w-full my-8"></div>

        <div className="relative bg-white rounded-3xl shadow-lg overflow-hidden h-48 max-w-full mb-4">
          <img
            src={workout.image_url}
            alt={workout.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-2xl font-semibold">{workout.name}</h3>
            <p className="text-xl">
              {workout.duration} {t("SavedWorkoutsSection.SavedWorkoutsSectionMinutes")} |{" "}
              {t(`SavedWorkoutsSection.levels.${workout.level}`)}
            </p>
          </div>
        </div>

        <div className="flex justify-between gap-4 mb-8 mt-8">
          <button
            className="flex-1 bg-green-100 text-green-700 px-6 py-4 rounded-3xl hover:bg-gray-300 transition"
            onClick={onClose}
          >
            {t("home.SavedWorkoutsSection.SavedWorkoutsSectioncancelText")}
          </button>
          <button
            className="flex-1 bg-gradient-to-b from-green-400 to-green-700 text-white px-6 py-4 rounded-3xl hover:bg-green-800 transition"
            onClick={onConfirm}
          >
            {t("home.SavedWorkoutsSection.SavedWorkoutsSectionconfirmText")}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteWorkoutModal;
