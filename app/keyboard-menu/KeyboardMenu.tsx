"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";

const ITEMS = ["Rename", "Duplicate", "Export", "Delete"];

const actionLog: string[] = [];
export const getActionLog = () => [...actionLog];
export const _resetActionLog = () => {
    actionLog.length = 0;
};

export const KeyboardMenu = () => {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        if (!open) return;
        itemRefs.current[0]?.focus();
    }, [open]);

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape") {
            // Nothing else to do — the menu goes away and the page carries on.
            setOpen(false);
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((index) => Math.min(index + 1, ITEMS.length - 1));
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => Math.max(index - 1, 0));
        }

        // Tab is the browser's business — it already knows how to move
        // between the buttons in here.
    };

    const runAction = (name: string) => {
        actionLog.push(name);
        setOpen(false);
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                    Document Actions
                </h2>

                <button
                    ref={triggerRef}
                    data-testid="trigger"
                    onClick={() => {
                        setActive(0);
                        setOpen(true);
                    }}
                    className="rounded bg-gray-900 px-3 py-1 text-sm text-white"
                >
                    Actions
                </button>

                {open && (
                    <div
                        role="menu"
                        data-testid="menu"
                        onKeyDown={onKeyDown}
                        className="w-48 rounded border border-gray-200 bg-white py-1"
                    >
                        {ITEMS.map((item, index) => (
                            <button
                                key={item}
                                ref={(el) => {
                                    itemRefs.current[index] = el;
                                }}
                                role="menuitem"
                                data-testid="item"
                                tabIndex={0}
                                onClick={() => runAction(item)}
                                className={`block w-full px-3 py-1 text-left text-sm ${
                                    index === active
                                        ? "bg-gray-900 text-white"
                                        : "text-gray-900"
                                }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                )}

                <p className="text-xs text-gray-700">
                    Last action:{" "}
                    <span data-testid="last-action">
                        {actionLog[actionLog.length - 1] ?? "none"}
                    </span>
                </p>
            </div>
        </main>
    );
};
