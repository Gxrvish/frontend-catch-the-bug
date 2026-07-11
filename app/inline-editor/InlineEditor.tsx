"use client";

import { useRef, useState } from "react";

import { trackElement } from "./elementTracker";

export const InlineEditor = () => {
    const [name, setName] = useState("Growth OKRs — Q3");
    const [draftName, setDraftName] = useState("");
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const startEditing = () => {
        setDraftName(name);
        setEditing(true);
        // The input is rendered now, so grab focus right away.
        inputRef.current?.focus();
    };

    const save = () => {
        setName(draftName);
        setEditing(false);
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div
                // Register the card with layout telemetry. React detaches
                // refs automatically on unmount, so tracking is one-way.
                ref={(el) => {
                    if (el) {
                        trackElement(el);
                    }
                }}
                className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Document title
                </p>

                {editing ? (
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            aria-label="display name"
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                        />
                        <button
                            onClick={save}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                        >
                            Save
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <p
                            data-testid="display-name"
                            className="text-sm font-semibold text-gray-900"
                        >
                            {name}
                        </p>
                        <button
                            onClick={startEditing}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600"
                        >
                            Edit
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
};
