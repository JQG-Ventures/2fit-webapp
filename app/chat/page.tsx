'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaTrash, FaPaperPlane } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import LoadingScreen from '../_components/animations/LoadingScreen';
import ChatComponent from '../_components/chat/Conversation';
import LockScreen from '../_components/others/LockScreen';
import { fetchUserConversation } from '../_services/userService';

const Chat: React.FC = () => {
    const [isPremium, setIsPremium] = useState(false);
    const [conversationData, setConversationData] = useState({ message: [] });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        const fetchConversation = async () => {
            if (session?.user?.userId) {
                try {
                    const messages = await fetchUserConversation(session.user.userId);
                    setConversationData({ message: messages });
                    setIsPremium(true);
                } catch (error) {
                    setError('Failed to load conversation. Please try again later.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchConversation();
    }, [session]);

    if (loading) return <LoadingScreen />;

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-[#1A1A1A] text-white">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-between items-center bg-[#1A1A1A] h-screen p-14 lg:pt-[10vh] relative">
            <div className="h-[10%] flex flex-row justify-left space-x-8 items-center w-full lg:max-w-3xl">
                <button onClick={() => router.back()} className="text-white">
                    <FaArrowLeft className="w-8 h-8" />
                </button>
                <h1 className="text-5xl text-white font-semibold">2Fit.AI Coach</h1>
            </div>
            <div className="h-[90%] flex flex-col justify-between items-center w-full">
                {isPremium ? (
                    <div className='h-[85%] w-full max-w-3xl overflow-hidden overflow-y-auto'>
                        <ChatComponent conversationData={conversationData} />
                    </div>
                ) : (
                    <LockScreen
                        message="Unlock premium features to access your personal fitness coach!"
                        buttonText="Unlock Your Coach"
                        onButtonClick={() => router.push('/upgrade')}
                    />
                )}
                <div className='h-[15%] flex flex-col w-full max-w-3xl'>
                    <div className="flex items-center text-gray-400 cursor-pointer p-4 space-x-4 hover:text-white">
                        <FaTrash className="text-2xl" />
                        <span className="text-2xl">Clear history</span>
                    </div>
                    <div className="flex items-center w-full py-8 space-x-4">
                        <input
                            type="text"
                            placeholder="Write your question here"
                            className="flex-grow bg-gray-800 rounded-full p-6 pl-8 text-white placeholder-gray-500 outline-none border-none focus:ring-0"
                        />
                        <button className="bg-green-500 text-white p-8 rounded-full focus:outline-none hover:bg-green-600">
                            <FaPaperPlane className="w-full h-full" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
