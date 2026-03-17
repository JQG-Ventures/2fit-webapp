export interface ChatMessage {
    timestamp: string;
    role: 'user' | 'assistant' | 'bot' | 'system';
    content: string;
}
