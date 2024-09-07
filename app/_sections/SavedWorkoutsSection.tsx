'use client';

import React, { useState } from 'react';
import { AiFillHeart, AiOutlineReload, AiOutlineClose } from 'react-icons/ai';

// Modal component
const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center relative z-60 w-11/12 max-w-lg sm:w-5/6">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                    <AiOutlineClose size={20} />
                </button>
                <div className='py-4'>
                    <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
                    <p className="mb-6">Do you want to remove this workout from your saved list?</p>
                </div>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onConfirm}
                        className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg hover:bg-red-600"
                    >
                        Yes, Remove
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

const SavedWorkoutsSection = ({ workouts }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [savedWorkouts, setSavedWorkouts] = useState(workouts);
    
    const handleHeartClick = (workout) => {
        setSelectedWorkout(workout);
        setModalOpen(true);
    };

    const handleConfirm = () => {
        setSavedWorkouts(savedWorkouts.filter(workout => workout !== selectedWorkout));
        setModalOpen(false);
        setSelectedWorkout(null);
    };

    const handleCancel = () => {
        setModalOpen(false);
        setSelectedWorkout(null);
    };

    return (
        <div className="bg-white p-4 rounded-lg">
            <div className="flex justify-between items-center mb-8 px-2">
                <h2 className="text-4xl font-bold text-gray-800">Saved Workouts</h2>
                <a href="#" className="text-blue-600 hover:underline text-lg lg:text-2xl">View All</a>
            </div>

            {savedWorkouts.length === 0 ? (
                // Empty State
                <div className="border-dashed border-2 border-gray-400 p-8 rounded-lg flex justify-center items-center">
                    <p className="text-gray-500 text-xl">Exercises that you like will appear here</p>
                </div>
            ) : (
                // Populated State with Scrollable Workouts
                <div className="flex overflow-x-auto py-2 px-2 no-scrollbar space-x-6 lg:space-x-12 xl:space-x-14">
                    {savedWorkouts.map((workout, index) => (
                        <div
                            key={index}
                            className="relative w-44 h-44 bg-white rounded-lg flex-shrink-0 transition-transform transform hover:scale-110 hover:shadow-lg active:scale-95 lg:w-56 lg:h-56 xl:w-64 xl:h-64"
                        >
                            <img
                                src={workout.image}
                                alt={workout.title}
                                className="object-cover w-full h-full rounded-lg transition-opacity duration-300 ease-in-out"
                            />
                            <div className="absolute bottom-0 left-0 p-2 bg-opacity-75 bg-gray-800 text-white w-full rounded-b-lg transition-opacity duration-300 ease-in-out">
                                <p className="text-lg truncate">{workout.title}</p>
                            </div>
                            <div className="absolute top-2 right-2">
                                <button
                                    onClick={() => handleHeartClick(workout)}
                                    className={`text-white p-1 rounded-full transition-transform transform ${
                                        selectedWorkout === workout ? 'bg-red-600' : 'bg-gray-800'
                                    }`}
                                >
                                    {selectedWorkout === workout ? <AiOutlineClose size={24} /> : <AiFillHeart size={24} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Render the confirmation modal */}
            <ConfirmationModal
                isOpen={modalOpen}
                onClose={handleCancel}
                onConfirm={handleConfirm}
            />
        </div>
    );
};

export default SavedWorkoutsSection;
