'use client';

import React, { useState, useEffect } from 'react';
import { FaRobot, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

// Example motivational messages
const motivationalMessages = [
    "Stay consistent and results will follow!",
    "Every workout is progress, no matter how small.",
    "Your only limit is the one you set yourself!",
    "Make today your best workout yet!",
    "Stay focused, stay fit!"
];

// Helper function to get the message of the day
const getMotivationalMessage = () => {
    const dayOfWeek = new Date().getDay(); // Get current day of the week (0 - Sunday, 6 - Saturday)
    return motivationalMessages[dayOfWeek % motivationalMessages.length];
};

const MotivationSection = ({ isBotUser }: { isBotUser: boolean }) => {
    const { t } = useTranslation('global');
    const [dailyMessage, setDailyMessage] = useState("");
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Set the daily motivational message based on the day of the week
        const message = getMotivationalMessage();
        setDailyMessage(message);
    }, []);

    const handleIconClick = () => {
        // Toggle visibility on icon click
        setIsVisible(!isVisible);
    };

    return (
        isVisible && (
            <div className="flex flex-col items-center w-[95%] max-w-4xl mx-auto p-8 rounded-2xl shadow-lg border border-gray-200 my-16 hover:shadow-2xl transition-shadow duration-300 ease-in-out"> 
                <div className="flex justify-between items-start w-full mb-6">
                    <div className="flex flex-col w-[80%]">
                        <h2 className="text-3xl font-bold mb-4">
                            {isBotUser ? t('home.motivation.main') : "Get Fit with 2Fit AI"}
                        </h2>
                        <p className="text-lg text-gray-600">
                            {isBotUser
                                ? dailyMessage
                                : "Achieve your fitness goals with a personal AI trainer designed just for you."
                            }
                        </p>                        
                    </div>
                    <div className="w-[20%] flex justify-end">
                        <div
                            style={{ backgroundColor: '#1f2937' }}
                            className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg relative cursor-pointer transition-transform duration-300 ease-in-out"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            onClick={handleIconClick}
                            aria-label={isHovered ? "Close motivational section" : "Open chatbot"}
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

                <div className="flex justify-between items-center w-full mt-4">
                    <p className="text-gray-700 text-lg">{t('home.trainer.talk')}</p>
                    <div className="button-container">
                        {isBotUser ? (
                            <button className="bg-green-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-green-700 transition-colors">
                                {t('home.trainer.letschat')}
                            </button>
                        ) : (
                            <button className="bg-green-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-green-700 transition-colors">
                                 {t('home.trainer.getyourplan')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    );
};

export default MotivationSection;
