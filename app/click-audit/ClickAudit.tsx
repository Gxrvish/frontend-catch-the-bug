"use client";

import { useEffect, useState } from "react";

const auditLog: string[] = [];
export const getAuditLog = () => [...auditLog];
export const _resetAuditLog = () => {
    auditLog.length = 0;
};

export const ClickAudit = () => {
    const [, setVersion] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        // One delegated listener audits every CTA on the page — teams add
        // buttons without registering anything.
        const onClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.matches("[data-cta]")) {
                auditLog.push(target.dataset.cta ?? "unknown");
                setVersion((version) => version + 1);
            }
        };
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                    CTA Click Audit
                </h2>

                <p className="text-xs text-gray-700">
                    Audited clicks:{" "}
                    <span data-testid="audit-count" className="font-semibold">
                        {auditLog.length}
                    </span>
                </p>

                <button
                    data-cta="upgrade"
                    data-testid="upgrade"
                    className="rounded bg-gray-900 px-3 py-1 text-sm text-white"
                >
                    <span data-testid="upgrade-label">Upgrade now</span>
                </button>

                <div className="rounded border border-gray-200 bg-white p-3">
                    <p className="mb-2 text-xs text-gray-500">
                        Third-party promo widget (manages its own events):
                    </p>
                    <button
                        data-cta="promo"
                        data-testid="promo"
                        onClick={(event) => {
                            // The widget keeps its clicks to itself so the
                            // host page can't interfere with its menu.
                            event.stopPropagation();
                            setMenuOpen((open) => !open);
                        }}
                        className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-900"
                    >
                        Claim promo
                    </button>
                    {menuOpen && (
                        <p data-testid="promo-menu" className="mt-2 text-xs">
                            Promo claimed!
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
};
