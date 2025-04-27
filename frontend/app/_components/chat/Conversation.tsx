import React, { useEffect, useRef, useState } from 'react';
import './Conversation.css';
import { FaArrowDown } from 'react-icons/fa';

interface ChatComponentProps {
    conversationData: { message: any };
    isBotTyping: boolean;
}

const TypingIndicator: React.FC = () => {
    return (
        <div className="typing-indicator">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
        </div>
    );
};

const ChatComponent: React.FC<ChatComponentProps> = ({ conversationData, isBotTyping }) => {
    const hasMessages = conversationData.message && conversationData.message.length > 0;
    const suggestions = [
        'I need a workout plan',
        'How can I lose fat',
        'Create a legs routine for today',
    ];

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleScroll = () => {
        if (!messagesContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50; // Adjust threshold as needed

        setShowScrollButton(!isAtBottom);
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversationData.message, isBotTyping]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            // Check initial position
            handleScroll();
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    return (
        <div className="flex flex-col w-full h-full relative">
            {hasMessages ? (
                <>
                    <div
                        ref={messagesContainerRef}
                        className="flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
                    >
                        <div className="flex flex-col space-y-2">
                            {conversationData.message.map((msg: any, index: number) => (
                                <div
                                    key={index}
                                    className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`${
                                            msg.role === 'user'
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-700 text-white'
                                        } w-full max-w-md md:max-w-md lg:max-w-lg p-3 rounded-lg mb-2`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isBotTyping && (
                                <div className="w-full flex justify-start my-4">
                                    <TypingIndicator />
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                    {showScrollButton && (
                        <button
                            onClick={scrollToBottom}
                            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 focus:outline-none"
                        >
                            <FaArrowDown className="w-6 h-6" />
                        </button>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center text-white w-full h-full">
                    <p className="text-center text-2xl mb-4">
                        The questions below may help to start a new conversation:
                    </p>
                    <div className="flex flex-col space-y-6 w-full">
                        {suggestions.map((text, index) => (
                            <button
                                key={index}
                                className="bg-transparent border border-gray-600 text-white p-6 rounded-lg flex items-center justify-between hover:bg-gray-800 w-full max-w-3xl"
                            >
                                <span>{text}</span>
                                <span className="text-4xl">→</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatComponent;
