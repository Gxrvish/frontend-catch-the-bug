"use client";

import { useEffect, useState } from "react";

import { createReactive } from "./reactive";

type Config = {
    promoCode?: string;
    autosave: boolean;
    theme: { color: string; density: string };
};

// The config lives outside React — panels only observe it.
const listeners = new Set<(path: string) => void>();
const config = createReactive<Config>(
    {
        promoCode: "LAUNCH10",
        autosave: true,
        theme: { color: "slate", density: "cozy" },
    },
    (path) => listeners.forEach((listener) => listener(path))
);

export const ReactiveConfig = () => {
    const [dirty, setDirty] = useState<string[]>([]);

    useEffect(() => {
        const listener = (path: string) =>
            setDirty((current) => [...current, path]);
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                    Workspace Config
                </h2>

                <p className="text-xs text-gray-700">
                    Unsaved changes:{" "}
                    <span data-testid="dirty" className="font-semibold">
                        {dirty.length === 0 ? "none" : dirty.join(", ")}
                    </span>
                </p>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => {
                            config.autosave = !config.autosave;
                        }}
                        className="rounded bg-gray-900 px-3 py-1 text-sm text-white"
                    >
                        Toggle autosave
                    </button>
                    <button
                        onClick={() => {
                            config.theme.color = "indigo";
                        }}
                        className="rounded bg-gray-900 px-3 py-1 text-sm text-white"
                    >
                        Set theme color
                    </button>
                    <button
                        onClick={() => {
                            delete config.promoCode;
                        }}
                        className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-900"
                    >
                        Remove promo code
                    </button>
                </div>

                <p className="text-xs text-gray-500">
                    Every button mutates the reactive config directly — the
                    badge above is driven purely by the change listener.
                </p>
            </div>
        </main>
    );
};
