import { type RefObject, useCallback, useEffect, useState } from "react";

import type { ChatMessage, UseSupportChatOptions } from "./supportChat.types";
import {
    connectChatSocket,
    makeUserMessage,
    seedMessages,
} from "./supportChatApi";

interface UseSupportChatReturn {
    messages: ChatMessage[];
    isAtBottom: boolean;
    unseenCount: number;
    handleScroll: () => void;
    sendMessage: (text: string) => void;
    jumpToLatest: () => void;
}

const NEAR_BOTTOM_THRESHOLD_PX = 40;

export function useSupportChat(
    scrollerRef: RefObject<HTMLDivElement | null>,
    options: UseSupportChatOptions = {}
): UseSupportChatReturn {
    const { autoAgentReplies = true } = options;

    const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [unseenCount, setUnseenCount] = useState(0);

    const scrollToBottom = useCallback(() => {
        const el = scrollerRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, [scrollerRef]);

    useEffect(() => {
        const disconnect = connectChatSocket(
            (message) => {
                setMessages((prev) => [...prev, message]);
                if (isAtBottom) {
                    scrollToBottom();
                } else {
                    setUnseenCount((count) => count + 1);
                }
            },
            { autoReplies: autoAgentReplies }
        );
        return disconnect;
        // Connect once on mount — reconnecting the socket on every render
        // would hammer the gateway.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleScroll = useCallback(() => {
        const el = scrollerRef.current;
        if (!el) {
            return;
        }
        const nearBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight <
            NEAR_BOTTOM_THRESHOLD_PX;
        setIsAtBottom(nearBottom);
        if (nearBottom) {
            setUnseenCount(0);
        }
    }, [scrollerRef]);

    const sendMessage = useCallback(
        (text: string) => {
            if (text.trim() === "") {
                return;
            }
            setMessages((prev) => [...prev, makeUserMessage(text.trim())]);
            // Jump straight to the message we just sent.
            scrollToBottom();
        },
        [scrollToBottom]
    );

    const jumpToLatest = useCallback(() => {
        scrollToBottom();
        setIsAtBottom(true);
        setUnseenCount(0);
    }, [scrollToBottom]);

    return {
        messages,
        isAtBottom,
        unseenCount,
        handleScroll,
        sendMessage,
        jumpToLatest,
    };
}
