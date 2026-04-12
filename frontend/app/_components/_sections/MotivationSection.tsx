'use client';

import React, { useState, useEffect } from 'react';
import { FaRobot, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

const MotivationSection = ({ isBotUser }: { isBotUser: boolean }) => {
    const { t, i18n } = useTranslation('global');
    const [dailyMessage, setDailyMessage] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const raw = t('home.motivation.phrases', { returnObjects: true }) as unknown;
        if (!Array.isArray(raw) || raw.length === 0) return;
        const phrases = raw.filter((item): item is string => typeof item === 'string');
        if (phrases.length === 0) return;
        const dayOfWeek = new Date().getDay();
        setDailyMessage(phrases[dayOfWeek % phrases.length] ?? '');
    }, [t, i18n.language]);

    const handleIconClick = () => {
        setIsVisible(!isVisible);
    };

    return (
        isVisible && (
            <section className="px-6 py-6">
                <div className="flex flex-col w-full p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                    <div className="flex justify-between items-start w-full mb-5">
                        <div className="flex flex-col w-[80%] pr-2">
                            <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                                {isBotUser
                                    ? t('home.motivation.main')
                                    : t('home.motivation.headlineGuest')}
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {isBotUser ? dailyMessage : t('home.motivation.base')}
                            </p>
                        </div>
                        <div className="w-[20%] flex justify-end">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg relative cursor-pointer transition-transform duration-300 ease-in-out bg-gray-800"
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                onClick={handleIconClick}
                                aria-label={
                                    isHovered
                                        ? t('home.motivation.mtvnlsection')
                                        : t('home.motivation.mtvnlchatbot')
                                }
                                role="button"
                            >
                                {isHovered ? (
                                    <FaTimes className="text-gray-100 text-3xl" />
                                ) : (
                                    <FaRobot className="text-gray-100 text-3xl" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="w-full border-t border-gray-300 my-4"></div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 w-full mt-4">
                        <p className="text-lg text-gray-700">{t('home.trainer.talk')}</p>
                        <div className="shrink-0">
                            {isBotUser ? (
                                <button
                                    type="button"
                                    onClick={() => router.push('/chat')}
                                    className="bg-green-500 text-white px-5 py-2.5 rounded-full text-lg font-semibold hover:bg-green-600 transition-colors"
                                    aria-label={t('home.trainer.letschat')}
                                >
                                    {t('home.trainer.letschat')}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="bg-green-500 text-white px-5 py-2.5 rounded-full text-lg font-semibold hover:bg-green-600 transition-colors"
                                    aria-label={t('home.trainer.getyourplan')}
                                >
                                    {t('home.trainer.getyourplan')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        )
    );
};

export default MotivationSection;
