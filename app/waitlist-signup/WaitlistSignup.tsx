"use client";

import { useState } from "react";

import { joinWaitlist } from "./waitlistApi";

export const WaitlistSignup = () => {
    const [position, setPosition] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // React 19 form actions run the whole submit lifecycle for us — no
    // preventDefault, no onSubmit plumbing. The action just awaits the API
    // and stores the outcome.
    const join = async (formData: FormData) => {
        const email = String(formData.get("email") ?? "").trim();
        if (!email) {
            return;
        }
        const result = await joinWaitlist(email);
        if (result.ok) {
            setPosition(result.position);
        } else {
            setError(result.error);
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Join the beta waitlist
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Drop your email and we&apos;ll save you a spot.
                </p>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    {position !== null && (
                        <p
                            data-testid="confirmation"
                            className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700"
                        >
                            You&apos;re in! Spot #{position} on the waitlist.
                        </p>
                    )}
                    {error && (
                        <p
                            data-testid="signup-error"
                            className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                        >
                            {error}
                        </p>
                    )}

                    <form action={join} className="flex gap-2">
                        <input
                            name="email"
                            type="email"
                            aria-label="email address"
                            placeholder="ada@example.com"
                            className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                        />
                        <button
                            type="submit"
                            className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                        >
                            Join waitlist
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
};
