"use client";

import { useEffect, useState } from "react";

import { off, on } from "./eventBus";

export const Bell = () => {
    const [alerts, setAlerts] = useState<string[]>([]);

    useEffect(() => {
        const handler = (message: string) => {
            setAlerts((prev) => [...prev, message]);
        };
        on("alert", handler);

        // Detach the bell's listener when it unmounts.
        return () => {
            off("alert", (message: string) => {
                setAlerts((prev) => [...prev, message]);
            });
        };
    }, []);

    return (
        <div
            data-testid="bell"
            className="rounded-lg border border-gray-200 bg-white p-4 text-xs text-gray-800"
        >
            Bell ({alerts.length})
        </div>
    );
};
