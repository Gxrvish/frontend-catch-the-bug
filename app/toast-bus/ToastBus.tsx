"use client";

import { useState } from "react";

import { Bell } from "./Bell";
import { ToastHub } from "./ToastHub";

export const ToastBus = () => {
    const [showBell, setShowBell] = useState(true);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                    Toast Bus
                </h2>

                <ToastHub />

                <button
                    onClick={() => setShowBell((v) => !v)}
                    className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs"
                >
                    Toggle bell
                </button>
                {showBell && <Bell />}
            </div>
        </main>
    );
};
