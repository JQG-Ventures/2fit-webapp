import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowCircleRight, FaSpinner } from 'react-icons/fa';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRedirect = () => {
        setLoading(true);
        setTimeout(() => {
            router.push('/workouts');
        }, 500);
    };

    return (
        <div
            className="flex flex-row items-center w-[95%] mx-auto p-4 rounded-2xl shadow-lg border border-gray-200 lg:my-16 hover:shadow-2xl cursor-pointer h-48"
            onClick={!loading ? handleRedirect : undefined}
        >
            <div className="w-[20%] h-full relative">
                <Image
                    src={exercise.image_url}
                    alt={exercise.name}
                    fill
                    className="w-full h-full rounded-lg object-cover"
                />
            </div>

            <div className="w-[80%] p-2 h-full ml-4 flex flex-col justify-between">
                <div className="flex flex-row justify-between">
                    <h3 className="text-2xl text-center font-semibold truncate">
                        {t('home.completeRoutine')}
                    </h3>
                    {loading ? (
                        <FaSpinner className="text-3xl animate-spin text-emerald-500" />
                    ) : (
                        <FaArrowCircleRight className="text-3xl transition-transform duration-200 ease-in-out" />
                    )}
                </div>

                <div>
                    <div className="flex flex-row justify-between">
                        <h3 className="text-base font-semibold truncate">{exercise.name}</h3>
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
