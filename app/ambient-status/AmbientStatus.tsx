"use client";

import { useEffect, useState } from "react";

export const AmbientStatus = () => {
    // Read the OS theme once up front — it's part of the environment.
    const [dark] = useState(
        () =>
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
    );
    const [activeSeconds, setActiveSeconds] = useState(0);

    useEffect(() => {
        // One tick per second of focus time.
        const id = setInterval(() => {
            setActiveSeconds((seconds) => seconds + 1);
        }, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                    Ambient Status
                </h2>

                <p className="text-sm text-gray-900">
                    Theme:{" "}
                    <span data-testid="theme" className="font-semibold">
                        {dark ? "dark" : "light"}
                    </span>
                </p>
                <p className="text-sm text-gray-900">
                    Active time:{" "}
                    <span data-testid="active" className="font-semibold">
                        {activeSeconds}
                    </span>
                    s
                </p>
            </div>
        </main>
    );
};
