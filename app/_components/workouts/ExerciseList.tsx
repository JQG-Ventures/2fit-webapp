'use client';

import { useTranslation } from 'react-i18next';


const ExerciseList = ({ exercises, isMobile }) =>  {
    console.log(exercises)
    const { t } = useTranslation('global');
    return (    
        <div className={isMobile ? 'pb-[13vh]' : ''}>
            <div className="no-scrollbar p-8 lg:max-w-screen-lg mx-auto">
                {exercises.map((exercise, index) => (
                    <div key={index} className="flex items-center justify-between my-5 bg-white rounded-3xl shadow-lg h-[13vh]">
                        <div className="w-[30%] h-full overflow-hidden rounded-tl-lg rounded-bl-lg">
                            <img
                                src={exercise.details.image_url}
                                alt={exercise.details.name}
                                className="object-cover h-full w-full"
                            />
                        </div>
                        <div className="w-[70%] text-left ml-6">
                            <h3 className="text-black text-4xl font-semibold mb-8">{exercise.details.name}</h3>
                            <p className="text-gray-700">{exercise.sets} sets x {exercise.reps} reps</p>
                            <p className="text-gray-500">{t("workouts.plan.rest")}: {exercise.rest_seconds} {t("workouts.plan.secs")}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
};

export default ExerciseList;
