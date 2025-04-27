import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowCircleRight } from 'react-icons/fa';
import Image from 'next/image';

interface PendingExerciseCardProps {
    exercise: {
        image_url: string;
        name: string;
        description: string;
        difficulty: string;
    };
}

const PendingExerciseCard: React.FC<PendingExerciseCardProps> = ({ exercise }) => {
    const { t } = useTranslation('global');

    return (
        <div className="flex flex-row items-center w-[95%] mx-auto p-4 rounded-2xl shadow-lg border border-gray-200 lg:my-16 hover:shadow-2xl cursor-pointer h-48">
            {/* Exercise Image */}
            <div className="w-[20%] h-full">
                <Image
                    src={exercise.image_url}
                    alt={exercise.name}
                    fill
                    className="w-full h-full rounded-lg object-cover"
                />
            </div>

            {/* Text Information */}
            <div className="w-[80%] p-2 h-full ml-4 flex flex-col justify-between">
                {/* Top Section */}
                <div className="flex flex-row justify-between">
                    <h3 className="text-2xl text-center font-semibold truncate">
                        {t('home.completeRoutine')}
                    </h3>
                    <FaArrowCircleRight className=" text-3xl" />
                </div>

                {/* Bottom Section */}
                <div>
                    <div className="flex flex-row justify-between">
                        <h3 className="text-base font-semibold truncate">{exercise.name}</h3>
                        {/* <p className="text-lg text-gray-500 capitalize">{exercise.difficulty}</p> */}
                    </div>

                    <div>
                        <p className="text-lg text-gray-600 truncate">{exercise.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingExerciseCard;
