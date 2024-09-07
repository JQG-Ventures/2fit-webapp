'use client';

import React, { useState, useEffect } from 'react';
import { FaRobot, FaTimes } from 'react-icons/fa';

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
                
                {/* Main Content Section */}
                <div className="flex justify-between items-start w-full mb-6">
                    {/* 80% for the main content */}
                    <div className="flex flex-col w-[80%]">
                        <h2 className="text-3xl font-bold mb-4">
                            {isBotUser ? `Keep up the great work!` : "Get Fit with 2Fit AI"}
                        </h2>
                        <p className="text-lg text-gray-600">
                            {isBotUser
                                ? dailyMessage
                                : "Achieve your fitness goals with a personal AI trainer designed just for you."
                            }
                        </p>                        
                    </div>

                    {/* 20% for the icon */}
                    <div className="w-[20%] flex justify-end">
                        {/* Bot Icon at Top-Right */}
                        <div
                            style={{ backgroundColor: '#1f2937' }}
                            className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg relative cursor-pointer"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            onClick={handleIconClick}
                        >
                            {isHovered ? (
                                <FaTimes className="text-gray-100 text-3xl" />
                            ) : (
                                <FaRobot className="text-gray-100 text-3xl" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Splitter */}
                <div className="w-full border-t border-gray-300 my-4"></div>

                {/* Footer Section */}
                <div className="flex justify-between items-center w-full mt-4">
                    {/* Footer content with text and button */}
                    <p className="text-gray-700 text-lg">Talk to your trainer</p>
                    <div className="button-container">
                        {isBotUser ? (
                            <button className="bg-green-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-green-700 transition-colors">
                                Let's Chat
                            </button>
                        ) : (
                            <button className="bg-green-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-green-700 transition-colors">
                                Get your plan
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    );
};

export default MotivationSection;
