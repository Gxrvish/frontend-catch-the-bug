"use client";

import { useRef, useState } from "react";

export const INVITE_LINK = "https://app.example.com/invite/9f2c7a1b44e08d31";

/** What fits in the pill UI. */
const shorten = (link: string) => `${link.slice(0, 34)}…`;

type Status = "idle" | "copying" | "copied" | "failed";

const LABELS: Record<Status, string> = {
    idle: "Copy link",
    copying: "Copying…",
    copied: "Copied!",
    failed: "Copy failed",
};

export const CopyInvite = () => {
    const [status, setStatus] = useState<Status>("idle");
    const linkRef = useRef<HTMLSpanElement>(null);

    const onCopy = () => {
        // Copy exactly what the user sees in the pill.
        const shown = linkRef.current?.textContent ?? "";
        navigator.clipboard.writeText(shown);
        setStatus("copied");
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                    Invite a Teammate
                </h2>

                <div className="flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-2">
                    <span
                        ref={linkRef}
                        data-testid="link-pill"
                        className="truncate text-sm text-gray-900"
                    >
                        {shorten(INVITE_LINK)}
                    </span>
                    <button
                        onClick={onCopy}
                        data-testid="copy"
                        className="rounded bg-gray-900 px-3 py-1 text-xs text-white"
                    >
                        {LABELS[status]}
                    </button>
                </div>

                <p data-testid="status" className="text-xs text-gray-700">
                    {LABELS[status]}
                </p>
            </div>
        </main>
    );
};
