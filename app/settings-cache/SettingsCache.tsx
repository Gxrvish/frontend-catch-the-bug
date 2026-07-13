"use client";

import { useState } from "react";

import type { Settings } from "./settingsCache";
import { DEFAULTS, loadSettings, saveSettings } from "./settingsCache";

export const SettingsCache = () => {
    const [settings, setSettings] = useState<Settings>(DEFAULTS);
    const [note, setNote] = useState("");

    const reload = () => {
        try {
            setSettings(loadSettings());
            setNote("Loaded from storage.");
        } catch (cause) {
            setNote(`Load crashed: ${String(cause)}`);
        }
    };

    const toggleLayout = () => {
        const next: Settings = {
            ...settings,
            layout: settings.layout === "grid" ? "list" : "grid",
        };
        setSettings(next);
        saveSettings(next);
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                    Viewer Settings
                </h2>

                <p className="text-sm text-gray-900">
                    Layout:{" "}
                    <span data-testid="layout" className="font-semibold">
                        {settings.layout}
                    </span>{" "}
                    · Page size: {settings.pageSize}
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={toggleLayout}
                        className="rounded bg-gray-900 px-3 py-1 text-sm text-white"
                    >
                        Toggle layout
                    </button>
                    <button
                        onClick={reload}
                        className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-900"
                    >
                        Reload from storage
                    </button>
                </div>

                {note && (
                    <p data-testid="note" className="text-xs text-gray-700">
                        {note}
                    </p>
                )}
            </div>
        </main>
    );
};
