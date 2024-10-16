'use client';

import { useState, useEffect } from 'react';
import Tag from '../others/Tag';
import ExerciseList from './WorkoutList';
import Modal from '../modals/ViewModal';
import { FaArrowLeft, FaUserAlt, FaClock, FaDumbbell } from 'react-icons/fa';
import useIsMobile from '../../_hooks/useIsMobile';
import WorkoutFooter from '../../_components/workouts/WorkoutFooterStart';
import { useTranslation } from 'react-i18next';


const WorkoutDetails: React.FC<{ workoutPlan: WorkoutPlan}> = ({ workoutPlan }) => {
    const exercises = workoutPlan.exercises || [];
    const isMobile = useIsMobile();
    const { t } = useTranslation('global');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSeeAllClick = () => {
        if (isMobile) {
            setIsFullScreen(true);
        } else {
            setIsModalOpen(true);
        }
    };

    useEffect(() => {
        if (isFullScreen || isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isFullScreen, isModalOpen]);

    const closeFullScreen = () => {
        setIsFullScreen(false);
    };

    return (
        <div className="my-10 px-10 text-center no-scrollbar flex flex-col items-center">
            <h1 className="text-black text-5xl font-semibold mb-10">{workoutPlan.name}</h1>
            <div className="flex justify-center space-x-4">
                <Tag icon={FaUserAlt} text={`Beginner`} />
                <Tag icon={FaClock} text={`${workoutPlan.duration} min`} />
                <Tag icon={FaDumbbell} text={`${exercises.length} workouts`} />
            </div>

            <div className="w-full border-t border-gray-300 mx-auto my-10"></div>

            <div className='flex flex-row justify-between w-full px-2'>
                <h2 className="text-black text-3xl font-semibold">{t("workouts.plan.workoutActivity")}</h2>
                <button 
                    className='text-emerald-600 text-md hover:text-emerald-800'
                    onClick={handleSeeAllClick}>
                    {t("workouts.plan.seeAll")}
                </button>
            </div>

            {isMobile && isFullScreen && (
                <div className="fixed inset-0 bg-gray-50 z-50 p-10 flex flex-col">
                    <div className='flex flex-row my-4'>
                        <button onClick={closeFullScreen} className="text-3xl">
                            <FaArrowLeft />
                        </button>
                        <h2 className="text-4xl font-semibold ml-8">{t("workouts.plan.workoutActivity")}</h2>
                    </div>
                    <div className="no-scrollbar overflow-y-auto flex-grow">
                        <ExerciseList exercises={exercises} isMobile={true} />
                    </div>
                    <WorkoutFooter 
                        onStartClick={() => {/* Add your start functionality here */}} 
                    />
                </div>
            )}

            {!isMobile && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t("workouts.plan.workoutActivity")}>
                    <ExerciseList exercises={exercises} isMobile={false} />
                </Modal>
            )}
        </div>
    );
};

export default WorkoutDetails;
