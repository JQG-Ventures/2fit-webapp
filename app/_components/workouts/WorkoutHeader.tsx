'use client'

import { FaArrowLeft, FaHeart } from 'react-icons/fa';

const WorkoutHeader = ({ onSaveClick, onBackClick, imageUrl }) => (
    <div className="relative w-full h-[30vh] bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }}>
        <div className="absolute top-8 lg:top-32 left-8">
            <button onClick={onBackClick} className="text-white p-2 bg-black bg-opacity-50 rounded-full">
                <FaArrowLeft />
            </button>
        </div>
        <div className="absolute top-8 lg:top-32 right-8">
            <button onClick={onSaveClick} className="text-white p-2 bg-black bg-opacity-50 rounded-full">
                <FaHeart />
            </button>
        </div>
    </div>
);

export default WorkoutHeader;