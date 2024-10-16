'use client'

import { useTranslation } from 'react-i18next';


const WorkoutFooter = ({ onStartClick }) => {
    const { t } = useTranslation('global');
    
    return (
        <div className="h-[13%] fixed bottom-0 left-0 right-0 flex justify-center items-center z-10 bg-white shadow-lg rounded-t-3xl">
            <button onClick={onStartClick} className="bg-gradient-to-r from-emerald-400 to-emerald-600 w-[90%] text-white px-6 py-8 rounded-full text-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out lg:max-w-screen-md">
                {t("workouts.plan.start")}
            </button>
        </div>
    )
};

export default WorkoutFooter;