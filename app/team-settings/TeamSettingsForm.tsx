"use client";

import { useEffect, useState } from "react";

import { _teammateEdit, loadSettings, saveSettings } from "./settingsApi";
import type { TeamSettingsDraft } from "./teamSettings.types";

export const TeamSettingsForm = () => {
    const [draft, setDraft] = useState<TeamSettingsDraft | null>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        let cancelled = false;
        loadSettings().then((doc) => {
            if (!cancelled) {
                setDraft({
                    teamName: doc.teamName,
                    webhookUrl: doc.webhookUrl,
                });
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const save = async () => {
        if (!draft) {
            return;
        }
        setSaved(false);
        // Grab the freshest version number right before writing, so the
        // save can never be rejected for carrying a stale version.
        const latest = await loadSettings();
        await saveSettings(draft, latest.version);
        setSaved(true);
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Team settings
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Changes apply to everyone on the team.
                </p>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    {saved && (
                        <p
                            data-testid="save-success"
                            className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700"
                        >
                            Settings saved.
                        </p>
                    )}

                    {draft === null ? (
                        <p className="text-sm text-gray-500">Loading…</p>
                    ) : (
                        <div className="space-y-3">
                            <label className="block text-sm">
                                <span className="mb-1 block font-medium text-gray-700">
                                    Team name
                                </span>
                                <input
                                    aria-label="team name"
                                    value={draft.teamName}
                                    onChange={(e) =>
                                        setDraft({
                                            ...draft,
                                            teamName: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                                />
                            </label>
                            <label className="block text-sm">
                                <span className="mb-1 block font-medium text-gray-700">
                                    Incident webhook URL
                                </span>
                                <input
                                    aria-label="webhook url"
                                    value={draft.webhookUrl}
                                    onChange={(e) =>
                                        setDraft({
                                            ...draft,
                                            webhookUrl: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                                />
                            </label>
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={save}
                                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                                >
                                    Save settings
                                </button>
                                <button
                                    onClick={() => _teammateEdit()}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600"
                                >
                                    Simulate teammate edit (other tab)
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};
