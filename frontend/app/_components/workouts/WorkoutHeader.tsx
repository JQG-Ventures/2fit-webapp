'use client';

import { FaArrowLeft, FaHeart } from 'react-icons/fa';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

const WorkoutHeader: React.FC<{
    onSaveClick: () => void;
    onBackClick: () => void;
    imageUrl: string;
}> = ({ onSaveClick, onBackClick, imageUrl }) => {
    const { t } = useTranslation('global');
    return (
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
                    type="button"
                    onClick={onBackClick}
                    className="text-white p-2 bg-black bg-opacity-50 rounded-full"
                    aria-label={t('a11y.goBack')}
                >
                    <FaArrowLeft />
                </button>
            </div>
            <div className="absolute top-8 lg:top-32 right-8">
                <button
                    type="button"
                    onClick={onSaveClick}
                    className="text-white p-2 bg-black bg-opacity-50 rounded-full"
                    aria-label={t('a11y.saveWorkout')}
                >
                    <FaHeart />
                </button>
            </div>
        </div>
    );
};

export default WorkoutHeader;
