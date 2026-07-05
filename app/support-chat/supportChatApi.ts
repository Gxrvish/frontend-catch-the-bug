import type { ChatMessage, ConnectOptions } from "./supportChat.types";

type Listener = (message: ChatMessage) => void;

const listeners = new Set<Listener>();
let messageSeq = 0;

const CANNED_REPLIES = [
    "Thanks for waiting! I'm checking your order status now.",
    "I can see the shipment left our warehouse yesterday.",
    "Could you confirm the last four digits of the card used?",
    "One moment while I pull up the delivery logs.\nThis can take a few seconds on our side.",
    "Good news — the courier has your package out for delivery today!",
    "Is there anything else I can help you with?",
];

export function seedMessages(): ChatMessage[] {
    const now = Date.now();
    return [
        { author: "agent", text: "Hi! You're chatting with Sam from support." },
        { author: "you", text: "Hey, my order #88231 hasn't arrived." },
        { author: "agent", text: "Sorry to hear that — let me take a look." },
        { author: "you", text: "It was supposed to arrive on Tuesday." },
        { author: "agent", text: "I understand, checking the courier now." },
        { author: "you", text: "Thanks, I'll wait." },
    ].map((m, i) => ({
        ...m,
        author: m.author as ChatMessage["author"],
        id: `seed-${i + 1}`,
        sentAt: now - (6 - i) * 60_000,
    }));
}

export function makeUserMessage(text: string): ChatMessage {
    return {
        id: `you-${++messageSeq}`,
        author: "you",
        text,
        sentAt: Date.now(),
    };
}

/** Simulated websocket: subscribes to incoming agent messages. */
export function connectChatSocket(
    onMessage: Listener,
    options: ConnectOptions = {}
): () => void {
    const { autoReplies = true, intervalMs = 6000 } = options;

    listeners.add(onMessage);

    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (autoReplies) {
        intervalId = setInterval(() => emitAgentMessage(), intervalMs);
    }

    return () => {
        listeners.delete(onMessage);
        if (intervalId !== undefined) {
            clearInterval(intervalId);
        }
    };
}

/** Pushes an agent message to every connected client. Also used by tests. */
export function emitAgentMessage(text?: string): ChatMessage {
    const message: ChatMessage = {
        id: `agent-${++messageSeq}`,
        author: "agent",
        text: text ?? CANNED_REPLIES[messageSeq % CANNED_REPLIES.length],
        sentAt: Date.now(),
    };
    listeners.forEach((listener) => listener(message));
    return message;
}
