"use client";

import { useEffect, useRef, useState } from "react";

type RatingDetail = { stars: number };

/** The embedded ratings widget — a separate team ships this. */
const RatingWidget = () => {
    const [stars, setStars] = useState(0);
    const rootRef = useRef<HTMLDivElement>(null);

    const pick = (value: number) => {
        setStars(value);
        // Announce the live change from the widget's own root element.
        rootRef.current?.dispatchEvent(
            new CustomEvent<RatingDetail>("rating:change", {
                detail: { stars: value },
            })
        );
    };

    const submit = () => {
        document.dispatchEvent(
            new CustomEvent<RatingDetail>("rating:submit", {
                detail: { stars },
            })
        );
    };

    return (
        <div
            ref={rootRef}
            className="space-y-2 rounded border border-gray-200 bg-white p-3"
        >
            <p className="text-xs text-gray-500">Embedded rating widget</p>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                    <button
                        key={value}
                        data-testid={`star-${value}`}
                        onClick={() => pick(value)}
                        className={`h-8 w-8 rounded text-sm ${
                            value <= stars
                                ? "bg-gray-900 text-white"
                                : "border border-gray-300 text-gray-900"
                        }`}
                    >
                        {value}
                    </button>
                ))}
            </div>
            <button
                data-testid="submit"
                onClick={submit}
                className="rounded bg-gray-900 px-3 py-1 text-sm text-white"
            >
                Submit rating
            </button>
        </div>
    );
};

/** The host page — it only knows the widget through its events. */
export const WidgetBridge = () => {
    const [live, setLive] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState<number | null>(null);

    useEffect(() => {
        const onChange = (event: Event) => {
            setLive((event as CustomEvent<{ stars: number }>).detail.stars);
        };
        const onSubmit = (event: Event) => {
            setSubmitted(
                (event as CustomEvent<{ stars: number }>).detail.stars
            );
        };
        document.addEventListener("rating:change", onChange);
        // Guard against double-handling the submit broadcast.
        document.addEventListener("rating:submit", onSubmit, { once: true });
        return () => {
            document.removeEventListener("rating:change", onChange);
            document.removeEventListener("rating:submit", onSubmit);
        };
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                    Product Page
                </h2>

                <p className="text-sm text-gray-900">
                    Live rating:{" "}
                    <span data-testid="live" className="font-semibold">
                        {live ?? "—"}
                    </span>{" "}
                    · Last submitted:{" "}
                    <span data-testid="submitted" className="font-semibold">
                        {submitted ?? "—"}
                    </span>
                </p>

                <RatingWidget />
            </div>
        </main>
    );
};
