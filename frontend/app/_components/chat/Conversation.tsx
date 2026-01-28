import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-700 text-gray-200'
                                        } w-full max-w-md md:max-w-md lg:max-w-lg p-5 rounded-xl mb-3 markdown-content shadow-sm`}
                                    >
                                        {msg.role === 'assistant' ? (
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({ node, ...props }) => (
                                                        <p className="mb-2 last:mb-0" {...props} />
                                                    ),
                                                    ul: ({ node, ...props }) => (
                                                        <ul
                                                            className="list-disc list-inside mb-2 space-y-1"
                                                            {...props}
                                                        />
                                                    ),
                                                    ol: ({ node, ...props }) => (
                                                        <ol
                                                            className="list-decimal list-inside mb-2 space-y-1"
                                                            {...props}
                                                        />
                                                    ),
                                                    li: ({ node, ...props }) => (
                                                        <li className="ml-4" {...props} />
                                                    ),
                                                    strong: ({ node, ...props }) => (
                                                        <strong
                                                            className="font-bold text-white"
                                                            {...props}
                                                        />
                                                    ),
                                                    em: ({ node, ...props }) => (
                                                        <em className="italic" {...props} />
                                                    ),
                                                    h1: ({ node, ...props }) => (
                                                        <h1
                                                            className="text-xl font-bold mb-2 mt-4 first:mt-0"
                                                            {...props}
                                                        />
                                                    ),
                                                    h2: ({ node, ...props }) => (
                                                        <h2
                                                            className="text-lg font-semibold mb-2 mt-3 first:mt-0"
                                                            {...props}
                                                        />
                                                    ),
                                                    h3: ({ node, ...props }) => (
                                                        <h3
                                                            className="text-base font-semibold mb-1 mt-2 first:mt-0"
                                                            {...props}
                                                        />
                                                    ),
                                                    code: ({ node, inline, ...props }: any) =>
                                                        inline ? (
                                                            <code
                                                                className="bg-gray-800 px-1 py-0.5 rounded text-sm"
                                                                {...props}
                                                            />
                                                        ) : (
                                                            <code
                                                                className="block bg-gray-800 p-2 rounded text-sm overflow-x-auto mb-2"
                                                                {...props}
                                                            />
                                                        ),
                                                    blockquote: ({ node, ...props }) => (
                                                        <blockquote
                                                            className="border-l-4 border-green-400 pl-4 italic my-2"
                                                            {...props}
                                                        />
                                                    ),
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        ) : (
                                            <span>{msg.content}</span>
                                        )}
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
                            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-700 text-white p-4 rounded-full shadow-lg hover:bg-green-600 focus:outline-none border border-green-600 transition-colors"
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
