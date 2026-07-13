"use client";

import { useState } from "react";

import type { Draft } from "./draftStore";
import { loadDraft, minutesSinceEdit, saveDraft } from "./draftStore";

export const DraftVault = () => {
    const [restored, setRestored] = useState<Draft | null>(null);
    const [error, setError] = useState("");

    const backup = () => {
        saveDraft({
            title: "Q3 launch plan",
            subtitle: undefined,
            tags: new Set(["urgent", "q3"]),
            updatedAt: new Date(),
        });
    };

    const restore = () => {
        try {
            const draft = loadDraft();
            if (draft) minutesSinceEdit(draft, Date.now());
            setRestored(draft);
            setError("");
        } catch (cause) {
            setError(String(cause));
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                    Draft Vault
                </h2>

                <div className="flex gap-2">
                    <button
                        onClick={backup}
                        className="rounded bg-gray-900 px-3 py-1 text-sm text-white"
                    >
                        Back up draft
                    </button>
                    <button
                        onClick={restore}
                        className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-900"
                    >
                        Restore
                    </button>
                </div>

                {error && (
                    <p data-testid="error" className="text-xs text-red-700">
                        {error}
                    </p>
                )}

                {restored && (
                    <div className="rounded border border-gray-200 bg-white p-3 text-sm text-gray-900">
                        <p className="font-semibold">{restored.title}</p>
                        <p className="text-xs text-gray-500">
                            {restored.subtitle ?? "(no subtitle)"} · tags:{" "}
                            {[...restored.tags].join(", ") || "(none)"}
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
};
