"use client";

import { useState } from "react";

import { postComment, SEED_COMMENTS } from "./commentApi";
import type { CommentRecord } from "./commentThread.types";

export const CommentThread = () => {
    const [comments, setComments] = useState<CommentRecord[]>(SEED_COMMENTS);
    const [draft, setDraft] = useState("");
    const [error, setError] = useState<string | null>(null);

    const submit = () => {
        const text = draft.trim();
        if (!text) {
            return;
        }
        const optimistic: CommentRecord = {
            id: `optimistic-${Date.now()}`,
            author: "you",
            text,
        };
        // Show the comment instantly; the server copy replaces it when the
        // POST lands.
        setComments((prev) => [...prev, optimistic]);
        setDraft("");
        setError(null);

        postComment(text, "you")
            .then((saved) =>
                setComments((prev) =>
                    prev.map((c) => (c.id === optimistic.id ? saved : c))
                )
            )
            .catch((e: unknown) => {
                // Moderation failures are rare; surfacing the error banner
                // is enough for now.
                setError(
                    e instanceof Error ? e.message : "Failed to post comment."
                );
                setComments((prev) =>
                    prev.filter((c) => c.id !== optimistic.id)
                );
            });
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-xl">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Comment Thread
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Comments post optimistically — they appear before the server
                    answers.
                </p>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    {error && (
                        <p
                            data-testid="post-error"
                            className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                        >
                            {error}
                        </p>
                    )}

                    <ul data-testid="comment-list" className="space-y-2">
                        {comments.map((comment) => (
                            <li
                                key={comment.id}
                                className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-sm text-gray-800"
                            >
                                <span className="font-medium">
                                    {comment.author}
                                </span>
                                : {comment.text}
                            </li>
                        ))}
                    </ul>

                    <div className="mt-3 flex gap-2">
                        <textarea
                            aria-label="write a comment"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            rows={1}
                            placeholder="Add a comment…"
                            className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                        />
                        <button
                            onClick={submit}
                            className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                        >
                            Post comment
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};
