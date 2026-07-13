"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";

export const AvatarPreview = () => {
    const [preview, setPreview] = useState<string | null>(null);
    const [thumb, setThumb] = useState<string | null>(null);

    const onPick = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        // Hand the browser the file and point the preview at it.
        setPreview(URL.createObjectURL(file));
    };

    const attach = () => {
        if (!preview) return;
        const url = preview;
        // The thumbnail markup has the URL now — the handle itself is no
        // longer needed, so release it right away.
        URL.revokeObjectURL(url);
        setThumb(url);
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                    Avatar Upload
                </h2>

                <input
                    type="file"
                    data-testid="picker"
                    accept="image/*"
                    onChange={onPick}
                    className="text-sm text-gray-900"
                />

                {preview && (
                    <img
                        src={preview}
                        alt="avatar preview"
                        data-testid="preview"
                        className="h-24 w-24 rounded-full border border-gray-200"
                    />
                )}

                <button
                    onClick={attach}
                    className="rounded bg-gray-900 px-3 py-1 text-sm text-white"
                >
                    Attach to profile
                </button>

                {thumb && (
                    <img
                        src={thumb}
                        alt="attached avatar"
                        data-testid="thumb"
                        className="h-10 w-10 rounded-full border border-gray-200"
                    />
                )}
            </div>
        </main>
    );
};
