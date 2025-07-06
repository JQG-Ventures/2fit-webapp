'use client';

import { FaArrowLeft, FaHeart } from 'react-icons/fa';
import Image from 'next/image';

const WorkoutHeader: React.FC<{
    onSaveClick: () => void;
    onBackClick: () => void;
    imageUrl: string;
}> = ({ onSaveClick, onBackClick, imageUrl }) => (
    <div className="relative w-full h-[30vh]">
        <Image
            src={imageUrl}
            alt="Workout background"
            layout="fill"
            className="object-cover"
            priority
        />
        <div className="absolute top-8 lg:top-32 left-8">
            <button
                onClick={onBackClick}
                className="text-white p-2 bg-black bg-opacity-50 rounded-full"
            >
                <FaArrowLeft />
            </button>
        </div>
        <div className="absolute top-8 lg:top-32 right-8">
            <button
                onClick={onSaveClick}
                className="text-white p-2 bg-black bg-opacity-50 rounded-full"
            >
                <FaHeart />
            </button>
        </div>
    </div>
);

export default WorkoutHeader;
