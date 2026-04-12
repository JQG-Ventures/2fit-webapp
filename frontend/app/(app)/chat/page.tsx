'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaTrash, FaPaperPlane } from 'react-icons/fa';
import ChatComponent from '@/app/_components/chat/Conversation';
import LockScreen from '@/app/_components/others/LockScreen';
import Modal from '@/app/_components/profile/modal';
import { useApiGet } from '@/app/utils/apiClient';
import { FaWhatsapp } from 'react-icons/fa';
import { useSendMessage } from '@/app/_services/userService';
import { useTranslation } from 'react-i18next';
import type { ApiResponse } from '@/app/_types/api';
import type { ChatMessage } from '@/app/_types/chat';

const WHATSAPP_BOT_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER ?? '50670340514';
const WHATSAPP_BOT_URL = `https://wa.me/${WHATSAPP_BOT_NUMBER}?text=Hey 2Fit bot!`;

const Chat: React.FC = () => {
    const router = useRouter();
    const { t } = useTranslation('global');

    const { data: conversationData, isError: errorConversation } = useApiGet<
        ApiResponse<ChatMessage[]>
    >(['conversationData'], '/api/users/conversation');
    const { data: profile, isError: errorProfile } = useApiGet<ApiResponse<UserProfile>>(
        ['profileData'],
        '/api/users/profile',
    );

    const { mutate: sendMessage } = useSendMessage(
        `${profile?.message.code_number ?? ''}${profile?.message.number ?? ''}`,
    );

    const [isPremium] = useState(true);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);

    useEffect(() => {
        const list = conversationData?.message;
        if (Array.isArray(list)) {
            setMessages(list);
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
        } satisfies ChatMessage;

        setMessages((prev) => [...prev, userMessage]);
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
                    } satisfies ChatMessage;

                    setMessages((prev) => [...prev, botMessage]);
                    setIsBotTyping(false);
                },
                onError: (error) => {
                    console.error('Error sending message:', error.message);
                    setIsBotTyping(false);
                },
            },
        );
    };

    if (errorConversation || errorProfile) {
        return (
            <Modal
                title="Error"
                message={t('chat.fetchingError')}
                onClose={() => router.push('/home')}
            />
        );
    }

    return (
        <div className="flex flex-col justify-between items-center bg-[#1A1A1A] h-screen p-14 lg:pt-[10vh] relative">
            <div className="h-[10%] flex flex-row justify-between space-x-8 items-center w-full lg:max-w-3xl">
                <div className="flex flex-row space-x-8">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="text-white"
                        aria-label={t('a11y.goBack')}
                    >
                        <FaArrowLeft className="w-8 h-8" />
                    </button>
                    <h1 className="text-5xl text-white font-semibold">2Fit.AI Coach</h1>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        if (typeof window !== 'undefined') {
                            window.open(WHATSAPP_BOT_URL, '_blank');
                        }
                    }}
                    aria-label={t('a11y.openWhatsApp')}
                >
                    <FaWhatsapp
                        className="text-white w-12 h-12"
                        aria-hidden
                        title={t('chat.openWhatsApp')}
                    />
                </button>
            </div>
            <div className="h-[90%] flex flex-col justify-between items-center w-full">
                {isPremium ? (
                    <div className="h-[85%] w-full max-w-3xl overflow-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
                        <ChatComponent
                            conversationData={{ message: messages }}
                            isBotTyping={isBotTyping}
                        />
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
                            type="button"
                            onClick={handleSendMessage}
                            className="bg-green-500 text-white p-8 rounded-full focus:outline-none hover:bg-green-600"
                            aria-label={t('a11y.sendMessage')}
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
