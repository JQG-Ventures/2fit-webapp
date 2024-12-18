'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaTrash, FaPaperPlane } from 'react-icons/fa';
import ChatComponent from '../_components/chat/Conversation';
import LockScreen from '../_components/others/LockScreen';
import Modal from '../_components/profile/modal';
import { useApiGet } from '../utils/apiClient';
import { FaWhatsapp } from 'react-icons/fa';
import { useSendMessage } from '../_services/userService';
import { useTranslation } from 'react-i18next';
import { useLoading } from '../_providers/LoadingProvider';

const Chat: React.FC = () => {
    const router = useRouter();
    const { t } = useTranslation('global');
    const { setLoading } = useLoading();

    const getChatUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/conversation`;
    const { data: conversationData, isLoading: loading, isError: error } = useApiGet<{ status: string; message: any }>(['conversationData'], getChatUrl);
    const getProfileUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/profile`;
    const { data: profile, isLoading: loadingProfile, isError: profileError } =
        useApiGet<{ status: string; message: any }>(['profileData'], getProfileUrl);

    useEffect(() => {
        if (loading || loadingProfile) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [loadingProfile, loading, setLoading])

    const { mutate: sendMessage } = useSendMessage(`${profile?.message.code_number}${profile?.message.number}`);

    const [isPremium, setIsPremium] = useState(true);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);

    useEffect(() => {
        if (Array.isArray(conversationData?.message)) {
            setMessages(conversationData.message);
        } else {
            setMessages([]);
        }
    }, [conversationData]);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        const userMessage = {
            timestamp: new Date().toISOString(),
            role: 'user',
            content: newMessage,
        };

        setMessages((prev: any) => [...prev, userMessage]);
        setNewMessage('');
        setIsBotTyping(true);

        sendMessage(
            { body: { message: newMessage } },
            {
                onSuccess: (response) => {
                    const botMessage = {
                        timestamp: new Date().toISOString(),
                        role: 'bot',
                        content: response.response,
                    };

                    setMessages((prev) => [...prev, botMessage]);
                    setIsBotTyping(false);
                },
                onError: (error) => {
                    console.error('Error sending message:', error.message);
                    setIsBotTyping(false);
                },
            }
        );
    };

    if (error) {
        return (
            <Modal
                title="Error"
                message={error}
                onClose={() => router.push('/home')}
            />
        );
    }

    return (
        <div className="flex flex-col justify-between items-center bg-[#1A1A1A] h-screen p-14 lg:pt-[10vh] relative">
            <div className="h-[10%] flex flex-row justify-between space-x-8 items-center w-full lg:max-w-3xl">
                <div className="flex flex-row space-x-8">
                    <button onClick={() => router.back()} className="text-white">
                        <FaArrowLeft className="w-8 h-8" />
                    </button>
                    <h1 className="text-5xl text-white font-semibold">2Fit.AI Coach</h1>
                </div>
                <button>
                    <FaWhatsapp onClick={() => window.open(`https://wa.me/${50670340514}?text=Hey 2Fit bot!`, '_blank')} className="text-white w-12 h-12" title={`${t('chat.openWhatsApp')}`}></FaWhatsapp>
                </button>
            </div>
            <div className="h-[90%] flex flex-col justify-between items-center w-full">
                {isPremium ? (
                    <div className="h-[85%] w-full max-w-3xl overflow-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
                        <ChatComponent conversationData={{ message: messages }} isBotTyping={isBotTyping} />
                    </div>
                ) : (
                    <LockScreen
                        message="Unlock premium features to access your personal fitness coach!"
                        buttonText="Unlock Your Coach"
                        onButtonClick={() => router.push('/upgrade')}
                    />
                )}
                <div className="h-[15%] flex flex-col w-full max-w-3xl">
                    <div className="flex items-center text-gray-400 cursor-pointer p-4 space-x-4 hover:text-white">
                        <FaTrash className="text-2xl" />
                        <span className="text-2xl">Clear history</span>
                    </div>
                    <div className="flex items-center w-full py-8 space-x-4">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Write your question here"
                            className="flex-grow bg-gray-800 rounded-full p-6 pl-8 text-white placeholder-gray-500 outline-none border-none focus:ring-0"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="bg-green-500 text-white p-8 rounded-full focus:outline-none hover:bg-green-600"
                        >
                            <FaPaperPlane className="w-full h-full" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
