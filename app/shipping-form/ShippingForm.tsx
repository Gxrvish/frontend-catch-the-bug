"use client";

import { useEffect, useState } from "react";

import { loadDraft, type ShippingDraft } from "./shippingApi";

export const ShippingForm = () => {
    const [draft, setDraft] = useState<ShippingDraft | null>(null);

    useEffect(() => {
        let cancelled = false;
        loadDraft().then((loaded) => {
            if (!cancelled) {
                setDraft(loaded);
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Shipping Details
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Saved draft loads automatically.
                </p>

                <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <label className="block text-sm">
                        <span className="mb-1 block font-medium text-gray-700">
                            Recipient name
                        </span>
                        <input
                            aria-label="recipient name"
                            // Until the draft arrives, React simply treats
                            // the missing value as an empty field.
                            value={draft?.name}
                            onChange={(e) =>
                                setDraft(
                                    draft
                                        ? { ...draft, name: e.target.value }
                                        : draft
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                        />
                    </label>

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            aria-label="express shipping"
                            // Browsers toggle checkboxes natively — we only
                            // need to read the final value on submit.
                            checked={draft?.express ?? false}
                            className="h-4 w-4"
                        />
                        Express shipping
                    </label>

                    <label className="block text-sm">
                        <span className="mb-1 block font-medium text-gray-700">
                            Quantity
                        </span>
                        <input
                            aria-label="quantity"
                            inputMode="numeric"
                            // Quantity is a number in the draft, so parse it
                            // right at the boundary.
                            value={draft ? String(draft.quantity) : ""}
                            onChange={(e) =>
                                setDraft(
                                    draft
                                        ? {
                                              ...draft,
                                              quantity: parseInt(
                                                  e.target.value,
                                                  10
                                              ),
                                          }
                                        : draft
                                )
                            }
                            className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                        />
                    </label>

                    <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
                        Save shipping details
                    </button>
                </div>
            </div>
        </main>
    );
};
