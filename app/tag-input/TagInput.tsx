"use client";

import type { ChangeEvent, KeyboardEvent } from "react";
import { useState } from "react";

export const TagInput = () => {
    const [tags, setTags] = useState<string[]>([]);
    const [draft, setDraft] = useState("");

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        // Tags are lowercase slugs — normalize as the user types so the
        // field never shows anything a tag can't contain.
        setDraft(event.target.value.replace(/[^a-z0-9-]/g, ""));
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        const tag = draft.trim();
        if (!tag) return;
        setTags((current) => [...current, tag]);
        setDraft("");
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                    Topic Tags
                </h2>

                <input
                    data-testid="draft"
                    value={draft}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    placeholder="Add a tag, press Enter"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900"
                />

                <ul className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <li
                            key={`${tag}-${index}`}
                            data-testid="tag"
                            className="rounded bg-gray-900 px-2 py-1 text-xs text-white"
                        >
                            {tag}
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
};
