"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { savePrefs } from "./prefsApi";

export const NotifyPrefs = () => {
    const [confirmation, setConfirmation] = useState("");

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        // The form is the source of truth — ship it as-is.
        const payload = Object.fromEntries(data);
        savePrefs(payload);

        const digestHour = payload.digestHour as string;
        // Confirm with the hour after the digest, when the follow-up
        // summary goes out.
        const followUp = digestHour + 1;
        setConfirmation(`Saved. Follow-up summary at ${followUp}:00.`);
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <form
                onSubmit={onSubmit}
                className="mx-auto max-w-md space-y-4 rounded border border-gray-200 bg-white p-4"
            >
                <h2 className="text-xl font-semibold text-gray-900">
                    Notification Preferences
                </h2>

                <label className="block text-sm text-gray-900">
                    Webhook URL
                    <input
                        name="webhook"
                        data-testid="webhook"
                        defaultValue="https://hooks.example.com/abc"
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-900">
                    <input
                        type="checkbox"
                        name="emailAlerts"
                        data-testid="email-alerts"
                        defaultChecked
                    />
                    Email alerts
                </label>

                <label className="block text-sm text-gray-900">
                    Digest hour
                    <input
                        name="digestHour"
                        data-testid="digest-hour"
                        inputMode="numeric"
                        defaultValue="8"
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>

                <label className="block text-sm text-gray-900">
                    Plan
                    <input
                        name="plan"
                        data-testid="plan"
                        defaultValue="pro"
                        disabled
                        className="mt-1 w-full rounded border border-gray-300 bg-gray-50 px-3 py-2"
                    />
                    <span className="mt-1 block text-xs text-gray-500">
                        Managed on the billing page — locked here.
                    </span>
                </label>

                <button
                    type="submit"
                    className="rounded bg-gray-900 px-3 py-1 text-sm text-white"
                >
                    Save preferences
                </button>

                {confirmation && (
                    <p
                        data-testid="confirmation"
                        className="text-xs text-gray-700"
                    >
                        {confirmation}
                    </p>
                )}
            </form>
        </main>
    );
};
