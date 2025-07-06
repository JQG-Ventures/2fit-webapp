'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FaFire, FaDumbbell, FaGem, FaArrowLeft } from 'react-icons/fa';
import { useApiGet } from '@/app/utils/apiClient';

const Challenges: React.FC = () => {
    const router = useRouter();
    const { t } = useTranslation('global');
    const [activeFilter, setActiveFilter] = useState('Todos');

    const categories = ['Todos', 'Abs', 'Piernas', 'Cardio', 'Fuerza'];

    const { data } = useApiGet<{ status: string; message: RawChallenge[] }>(
        ['challenges'],
        '/api/challenges/challenges',
        {
            suspense: true,
        },
    );

    const transformedChallenges =
        data?.message.map((challenge: RawChallenge) => ({
            id: challenge._id,
            title: challenge.name,
            days: challenge.duration_days,
            image: challenge.image_url,
            category: challenge.category || [],
            intensity: challenge.intensity,
            equipment: challenge.equipment?.length > 0,
            premium: challenge.price > 0,
        })) || [];

    const filteredChallenges =
        activeFilter === 'Todos'
            ? transformedChallenges
            : transformedChallenges.filter((c) => c.category.includes(activeFilter.toLowerCase()));

    return (
        <div className="flex flex-col h-screen bg-white p-10 items-center lg:pt-[10vh]">
            <div className="h-[10%] flex flex-row items-center justify-center w-full lg:max-w-3xl">
                <button
                    onClick={() => router.back()}
                    className="absolute left-10 text-gray-700 mr-4"
                >
                    <FaArrowLeft className="w-8 h-8" />
                </button>
                <h1 className="text-5xl text-center font-semibold lg:w-full">
                    {t('workouts.challenges.title')}
                </h1>
            </div>

            <div className="w-full h-[80%] overflow-y-auto pt-10 lg:max-w-3xl">
                {/* Filtros */}
                <div className="flex space-x-4 overflow-x-auto pb-4">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveFilter(category)}
                            className={`px-4 py-2 rounded-full border ${
                                activeFilter === category
                                    ? 'bg-green-100 text-black font-semibold'
                                    : 'text-gray-600'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Lista de Challenges */}
                <div className="grid grid-cols-2 gap-6 pt-6">
                    {filteredChallenges.map((challenge) => (
                        <div key={challenge.id} className="flex flex-col cursor-pointer">
                            <div
                                onClick={() => router.push(`/workouts/challenges/${challenge.id}`)}
                                className="rounded-2xl overflow-hidden relative w-full aspect-square bg-gray-200"
                                style={{
                                    backgroundImage: `url(${challenge.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            >
                                {challenge.premium && (
                                    <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                                        <FaGem className="text-blue-500" />
                                    </div>
                                )}
                            </div>
                            <h3 className="mt-2 font-semibold text-lg">{challenge.title}</h3>
                            <div className="text-gray-600 text-sm">{challenge.days} días</div>
                            <div className="flex items-center space-x-2 text-gray-700 mt-1">
                                {challenge.intensity && <FaFire className="text-red-500" />}
                                {challenge.equipment && <FaDumbbell />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default React.memo(Challenges);
