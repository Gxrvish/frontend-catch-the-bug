"use client";

import { useEffect, useState } from "react";

import type { NoteRow } from "./idb";
import { getAllNotes, saveNote } from "./notesDb";

export const OfflineNotes = () => {
    const [notes, setNotes] = useState<NoteRow[]>([]);
    const [draft, setDraft] = useState("");
    const [error, setError] = useState<string | null>(null);

    const load = () => {
        getAllNotes()
            .then((rows) => setNotes(rows ?? []))
            .catch((err) => setError(String(err)));
    };

    useEffect(() => {
        load();
    }, []);

    const onSave = () => {
        if (!draft.trim()) {
            return;
        }
        saveNote(draft)
            .then(() => {
                setDraft("");
                load();
            })
            .catch((err) => setError(String(err)));
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                    Offline Notes
                </h2>

                <div className="flex gap-2">
                    <input
                        aria-label="note"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="New note"
                        className="flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm"
                    />
                    <button
                        onClick={onSave}
                        className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs"
                    >
                        Save
                    </button>
                </div>

                {error && (
                    <p data-testid="error" className="text-xs text-red-600">
                        {error}
                    </p>
                )}

                <ul className="space-y-1">
                    {(notes ?? []).map((note) => (
                        <li
                            key={note.id}
                            data-testid="note"
                            className="rounded border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800"
                        >
                            {note.text}
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
};
