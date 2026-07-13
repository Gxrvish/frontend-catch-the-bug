"use client";

import { useEffect, useRef, useState } from "react";

type Message = { id: number; text: string; replies: string[] };

let nextId = 1;

export const MentionWatch = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [mentions, setMentions] = useState(0);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const observer = new MutationObserver((mutations) => {
            // Each delivery is one batch — count what it brought in.
            const batch = mutations[0];
            let found = 0;
            batch.addedNodes.forEach((node) => {
                if (node instanceof HTMLElement) {
                    found += node.querySelectorAll(".mention").length;
                    if (node.classList.contains("mention")) found += 1;
                }
            });
            if (found > 0) setMentions((count) => count + found);
        });

        // Watch new children of the transcript.
        observer.observe(root, { childList: true });

        return () => observer.disconnect();
    }, []);

    const deliver = (texts: string[]) => {
        setMessages((current) => [
            ...current,
            ...texts.map((text) => ({ id: nextId++, text, replies: [] })),
        ]);
    };

    const deliverReply = () => {
        setMessages((current) =>
            current.length === 0
                ? current
                : current.map((message, index) =>
                      index === 0
                          ? {
                                ...message,
                                replies: [...message.replies, "@garvish +1"],
                            }
                          : message
                  )
        );
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                    Live Transcript
                </h2>

                <p className="text-sm text-gray-900">
                    Mentions:{" "}
                    <span data-testid="mentions" className="font-semibold">
                        {mentions}
                    </span>
                </p>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => deliver(["@garvish ping"])}
                        className="rounded bg-gray-900 px-3 py-1 text-sm text-white"
                    >
                        Deliver one
                    </button>
                    <button
                        onClick={() =>
                            deliver([
                                "@garvish standup?",
                                "@garvish review please",
                                "@garvish deploy done",
                            ])
                        }
                        className="rounded bg-gray-900 px-3 py-1 text-sm text-white"
                    >
                        Deliver three
                    </button>
                    <button
                        onClick={deliverReply}
                        className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-900"
                    >
                        Reply to first
                    </button>
                </div>

                <div
                    ref={rootRef}
                    data-testid="transcript"
                    className="space-y-2"
                >
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className="mention rounded border border-gray-200 bg-white px-3 py-1 text-sm text-gray-900"
                        >
                            {message.text}
                            <div className="ml-4 space-y-1">
                                {message.replies.map((reply, index) => (
                                    <div
                                        key={index}
                                        className="mention text-xs text-gray-700"
                                    >
                                        {reply}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
};
