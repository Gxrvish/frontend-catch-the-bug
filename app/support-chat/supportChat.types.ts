export interface ChatMessage {
    id: string;
    author: "agent" | "you";
    text: string;
    sentAt: number;
}

export interface ConnectOptions {
    /** Push canned agent replies on an interval. Disabled in tests. */
    autoReplies?: boolean;
    intervalMs?: number;
}

export interface UseSupportChatOptions {
    autoAgentReplies?: boolean;
}
