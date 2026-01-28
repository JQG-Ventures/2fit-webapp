'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaTrash, FaPaperPlane } from 'react-icons/fa';
import ChatComponent from '../_components/chat/Conversation';
import LockScreen from '../_components/others/LockScreen';
import Modal from '../_components/profile/modal';
import {
    useSendAgentMessage,
    useGetAgentConversation,
    useClearAgentConversation,
} from '../_services/userService';
import { useTranslation } from 'react-i18next';

const Chat: React.FC = () => {
    const router = useRouter();
    const { t } = useTranslation('global');

    const {
        data: conversationData,
        isError: error,
        refetch: refetchConversation,
    } = useGetAgentConversation();
    const { mutate: sendMessage, isPending: isSending } = useSendAgentMessage();
    const { mutate: clearConversation } = useClearAgentConversation();

    const [isPremium, setIsPremium] = useState(true);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);

    useEffect(() => {
        if (Array.isArray(conversationData?.message)) {
            const formattedMessages = conversationData.message.map((msg: any) => ({
                timestamp: msg.timestamp || new Date().toISOString(),
                role: msg.role,
                content: msg.content,
            }));
            setMessages(formattedMessages);
        } else {
            setMessages([]);
        }
    }, [conversationData]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || isSending) return;

        const userMessage = {
            timestamp: new Date().toISOString(),
            role: 'user',
            content: newMessage,
        };

        setMessages((prev: any) => [...prev, userMessage]);
        const messageToSend = newMessage;
        setNewMessage('');
        setIsBotTyping(true);

        sendMessage(
            { body: { message: messageToSend } },
            {
                onSuccess: (response) => {
                    const botMessage = {
                        timestamp: new Date().toISOString(),
                        role: 'assistant',
                        content: response.message,
                    };

                    setMessages((prev) => [...prev, botMessage]);
                    setIsBotTyping(false);
                    refetchConversation();
                },
                onError: (error: any) => {
                    console.error('Error sending message:', error);
                    setIsBotTyping(false);
                    const errorMessage = {
                        timestamp: new Date().toISOString(),
                        role: 'assistant',
                        content: 'I apologize, but I encountered an error. Please try again.',
                    };
                    setMessages((prev) => [...prev, errorMessage]);
                },
            },
        );
    };

    const handleClearHistory = () => {
        clearConversation(
            {},
            {
                onSuccess: () => {
                    setMessages([]);
                    refetchConversation();
                },
                onError: (error) => {
                    console.error('Error clearing conversation:', error);
                },
            },
        );
    };

    useEffect(() => {
        if (error) {
            // Handle error in effect to avoid setState during render
            console.error('Error loading conversation:', error);
        }
    }, [error]);

    return (
        <div className="flex flex-col justify-between items-center bg-[#1A1A1A] h-screen p-14 lg:pt-[10vh] relative">
            <div className="h-[10%] flex flex-row justify-between space-x-8 items-center w-full lg:max-w-3xl">
                <div className="flex flex-row space-x-8">
                    <button onClick={() => router.back()} className="text-white">
                        <FaArrowLeft className="w-8 h-8" />
                    </button>
                    <h1 className="text-5xl text-white font-semibold">2Fit.AI Coach</h1>
                </div>
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
                    <div
                        onClick={handleClearHistory}
                        className="flex items-center text-gray-400 cursor-pointer p-4 space-x-4 hover:text-white"
                    >
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
                            disabled={isSending || !newMessage.trim()}
                            className="bg-green-700 text-white p-8 rounded-full focus:outline-none hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed border border-green-600 transition-colors"
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
