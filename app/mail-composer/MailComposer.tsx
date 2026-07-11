"use client";

import { useState } from "react";

import { Composer } from "./Composer";
import { CONVERSATIONS } from "./conversationData";
import type { ComposeMode } from "./mailComposer.types";

export const MailComposer = () => {
    const [selectedId, setSelectedId] = useState(CONVERSATIONS[0].id);
    const [mode, setMode] = useState<ComposeMode>("reply");

    const selected =
        CONVERSATIONS.find((c) => c.id === selectedId) ?? CONVERSATIONS[0];

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto flex max-w-3xl gap-4">
                <ul className="w-56 shrink-0 space-y-1">
                    {CONVERSATIONS.map((conversation) => (
                        <li key={conversation.id}>
                            <button
                                onClick={() => setSelectedId(conversation.id)}
                                className={`w-full rounded-lg px-3 py-2 text-left text-xs ${
                                    conversation.id === selectedId
                                        ? "bg-indigo-600 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <span className="block font-medium">
                                    {conversation.subject}
                                </span>
                                <span
                                    className={
                                        conversation.id === selectedId
                                            ? "text-indigo-200"
                                            : "text-gray-400"
                                    }
                                >
                                    {conversation.from}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="flex-1">
                    <div className="mb-2 flex gap-1">
                        {(["reply", "forward"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setMode(tab)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${
                                    mode === tab
                                        ? "bg-gray-900 text-white"
                                        : "bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* React tears the composer down whenever its props
                        change, so each conversation and each mode starts
                        from a clean slate. */}
                    {mode === "reply" ? (
                        <Composer conversation={selected} mode="reply" />
                    ) : (
                        <Composer conversation={selected} mode="forward" />
                    )}
                </div>
            </div>
        </main>
    );
};
