import React from 'react';
import { FiPlayCircle } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import { GiWeightLiftingUp } from 'react-icons/gi';
import Image from 'next/image';
import { capitalizeFirstLetter } from '@/app/utils/utils';
import { useTranslation } from 'react-i18next';

interface ExerciseDetailsModalProp {
    exercise: Exercise;
    onClose: () => void;
    onStartExercise: () => void;
}

const ExerciseDetailsModal: React.FC<ExerciseDetailsModalProp> = ({
    exercise,
    onClose,
    onStartExercise,
}) => {
    const { t } = useTranslation('global');

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div
                className="relative bg-white rounded-3xl overflow-hidden w-5/6 lg:max-w-2xl mx-auto my-auto"
                style={{ height: '85vh' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="h-full flex flex-col">
                    <div className="relative h-[80%]">
                        <Image
                            src={exercise.image_url}
                            alt={exercise.name}
                            layout="fill"
                            objectFit="cover"
                            className="w-full h-full object-cover"
                        />
                        <button
                            className="absolute inset-0 flex items-center justify-center"
                            onClick={onStartExercise}
                        >
                            <FiPlayCircle className="text-white text-9xl bg-green-500 rounded-full p-4 animate-pulse shadow-xl" />
                        </button>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-evenly items-center bg-gradient-to-b from-gray-200 via-gray-500 to-black">
                        <div className="w-full flex flex-col items-center space-y-2">
                            <h2 className="text-2xl font-semibold text-white">{exercise.name}</h2>
                            <p className="text-lg text-white">
                                {exercise.description || 'No description available.'}
                            </p>
                        </div>
                        <div className="w-[95%] flex flex-row justify-around items-center bg-white p-4 rounded-full">
                            <div className="flex flex-row items-center">
                                <FaFire className="text-black text-xl mr-1" />
                                <span className="text-lg">
                                    {exercise.sets} {capitalizeFirstLetter('sets')}
                                </span>
                            </div>
                            <div className="flex flex-row items-center">
                                <FaFire className="text-black text-xl mr-1" />
                                <span className="text-lg">
                                    {exercise.reps} {capitalizeFirstLetter('reps')}
                                </span>
                            </div>
                            <div className="flex flex-row items-center">
                                <GiWeightLiftingUp className="text-black text-xl mr-1" />
                                <span className="text-lg">
                                    {t(`exercise.level.${exercise.difficulty}`) || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        className="absolute top-2 right-2 mt-2 mr-4 text-gray-200"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExerciseDetailsModal;
