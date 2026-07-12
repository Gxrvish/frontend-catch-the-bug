"use client";

import { useState } from "react";

import { emit, on } from "./eventBus";

let SEQ = 0;

export const ToastHub = () => {
    const [toasts, setToasts] = useState<string[]>([]);

    // Listen for toast events and stack them up as they arrive.
    on("toast", (message) => {
        setToasts((prev) => [...prev, message]);
    });

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <button
                onClick={() => emit("toast", `Saved ${++SEQ}`)}
                className="rounded border border-gray-300 px-3 py-1.5 text-xs"
            >
                Show toast
            </button>

            <ul className="mt-3 space-y-1">
                {toasts.map((toast, i) => (
                    <li
                        key={i}
                        data-testid="toast"
                        className="rounded bg-amber-50 px-3 py-2 text-xs text-amber-800"
                    >
                        {toast}
                    </li>
                ))}
            </ul>
        </div>
    );
};
