'use client';

import { useTranslation } from 'react-i18next';
import Image from 'next/image';

const ExerciseList: React.FC<{
    exercises: Exercise[];
    isMobile: boolean;
    onExerciseSelect: (exercise: Exercise) => void;
}> = ({ exercises, isMobile, onExerciseSelect }) => {
    const { t } = useTranslation('global');
    return (
        <div className={isMobile ? 'pb-[13vh]' : ''}>
            <div className="no-scrollbar p-8 lg:max-w-3xl mx-auto">
                {exercises.map((exercise, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between my-5 border rounded-2xl bg-gray-100 h-[13vh] p-4"
                        onClick={() => onExerciseSelect(exercise)}
                    >
                        <div className="relative w-[20%] h-full overflow-hidden rounded-2xl">
                            <Image
                                src={exercise.image_url}
                                alt={exercise.name}
                                layout="fill"
                                objectFit="cover"
                                className="object-cover"
                            />
                        </div>
                        <div className="w-[80%] text-left ml-6">
                            <h3 className="text-black font-semibold mb-4 mt-4">{exercise.name}</h3>
                            <p className="text-gray-700 text-lg">
                                {exercise.sets} sets x {exercise.reps} reps
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                {t('workouts.plan.rest')}: {exercise.rest_seconds}{' '}
                                {t('workouts.plan.secs')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExerciseList;
