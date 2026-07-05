"use client";

import { useRef, useState } from "react";

import type { UseSupportChatOptions } from "./supportChat.types";
import { emitAgentMessage } from "./supportChatApi";
import { useSupportChat } from "./useSupportChat";

export const ChatPane = (options: UseSupportChatOptions) => {
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const [draft, setDraft] = useState("");

    const { messages, unseenCount, handleScroll, sendMessage, jumpToLatest } =
        useSupportChat(scrollerRef, options);

    const send = () => {
        sendMessage(draft);
        setDraft("");
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto flex max-w-xl flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">
                            Support Chat
                        </h2>
                        <p className="text-xs text-gray-500">
                            Sam · online · replies every few seconds
                        </p>
                    </div>
                    <button
                        onClick={() => emitAgentMessage()}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                        Trigger agent reply
                    </button>
                </div>

                <div className="relative">
                    <div
                        ref={scrollerRef}
                        onScroll={handleScroll}
                        data-testid="chat-scroller"
                        className="h-96 space-y-2 overflow-y-auto p-4"
                    >
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                data-message
                                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm whitespace-pre-line ${
                                    m.author === "you"
                                        ? "ml-auto bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                            >
                                {m.text}
                            </div>
                        ))}
                    </div>

                    {unseenCount > 0 && (
                        <button
                            onClick={jumpToLatest}
                            className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white shadow"
                        >
                            {unseenCount} new message
                            {unseenCount > 1 ? "s" : ""} ↓
                        </button>
                    )}
                </div>

                <div className="flex gap-2 border-t border-gray-200 p-3">
                    <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && send()}
                        placeholder="Type a message..."
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={send}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Send
                    </button>
                </div>
            </div>
        </main>
    );
};
