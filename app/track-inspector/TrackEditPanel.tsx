"use client";

import { useState } from "react";

import type { Track, TrackPatch } from "./trackInspector.types";

interface TrackEditPanelProps {
    track: Track;
    onSave: (id: string, patch: TrackPatch) => void;
}

export const TrackEditPanel = ({ track, onSave }: TrackEditPanelProps) => {
    // Seed the editable draft from the selected track so the form starts
    // out pre-filled instead of empty.
    const [draft, setDraft] = useState<TrackPatch>({
        title: track.title,
        bpm: track.bpm,
        explicit: track.explicit,
    });

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-1 text-sm font-semibold text-gray-900">
                Edit track
            </h3>
            <p className="mb-3 text-xs text-gray-500">
                {track.artist} ·{" "}
                <span data-testid="editing-id">{track.id}</span>
            </p>

            <div className="space-y-3">
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                        Title
                    </label>
                    <input
                        aria-label="track title"
                        value={draft.title}
                        onChange={(e) =>
                            setDraft((d) => ({ ...d, title: e.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                        BPM
                    </label>
                    <input
                        aria-label="track bpm"
                        type="number"
                        value={draft.bpm}
                        onChange={(e) =>
                            setDraft((d) => ({
                                ...d,
                                bpm: Number(e.target.value) || 0,
                            }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
                    />
                </div>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                    <input
                        aria-label="explicit flag"
                        type="checkbox"
                        checked={draft.explicit}
                        onChange={(e) =>
                            setDraft((d) => ({
                                ...d,
                                explicit: e.target.checked,
                            }))
                        }
                    />
                    Explicit lyrics
                </label>

                <button
                    onClick={() => onSave(track.id, draft)}
                    className="w-full rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                >
                    Save changes
                </button>
            </div>
        </div>
    );
};
