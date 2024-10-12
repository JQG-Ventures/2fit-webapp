import React from 'react';

const ChatComponent = ({ conversationData }) => {
    const hasMessages = conversationData.message && conversationData.message.length > 0;
    const suggestions = ['I need a workout plan', 'How can I lose fat', 'Create a legs routine for today'];

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-3xl space-y-6 h-full">
            {hasMessages ? (
                conversationData.message.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        <div
                            key={index}
                            className={`${
                                msg.role === 'user' ? 'bg-green-500 text-white' : 'bg-gray-700 text-white'
                            } w-4/5 p-3 rounded-lg`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center text-white w-full">
                    <p className="text-center text-2xl mb-4">The questions below may help to start a new conversation:</p>
                    <div className="flex flex-col space-y-6 w-full">
                        {suggestions.map((text, index) => 
                            <button 
                                key={index}
                                className="bg-transparent border border-gray-600 text-white p-6 rounded-lg flex items-center justify-between hover:bg-gray-800 w-full max-w-3xl">
                                <span>{text}</span>
                                <span className="text-4xl">→</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatComponent;
