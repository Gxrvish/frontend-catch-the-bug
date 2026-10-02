"use client";

import { useState } from "react";

import { CartProvider, useCart } from "./CartContext";
import type { ShippingMethod } from "./checkout.types";
import { PriceBreakdown } from "./PriceBreakdown";

const GiftNoteInput = () => {
    const { giftNote, setGiftNote } = useCart();
    const [draftInput, setDraftInput] = useState(giftNote);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <label className="mb-1 block text-sm font-semibold text-gray-900">
                Gift note
            </label>
            <input
                value={draftInput}
                onChange={(e) => setDraftInput(e.target.value)}
                onBlur={() => setGiftNote(draftInput)}
                placeholder="Happy birthday!..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
                Watch the Order Summary render badge while you type here.
            </p>
        </div>
    );
};

const CartItemList = () => {
    const { items, updateQuantity } = useCart();

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Your Cart
            </h3>
            <ul className="space-y-2">
                {items.map((item) => (
                    <li
                        key={item.id}
                        className="flex items-center justify-between text-sm text-gray-800"
                    >
                        <span>
                            {item.name} · ${item.unitPrice}
                        </span>
                        <input
                            type="number"
                            min={1}
                            aria-label={`${item.name} quantity`}
                            value={item.quantity}
                            onChange={(e) =>
                                updateQuantity(item.id, Number(e.target.value))
                            }
                            className="h-7 w-14 rounded border border-gray-300 text-center text-sm"
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};

const CouponForm = () => {
    const { applyCoupon, coupon } = useCart();
    const [code, setCode] = useState("");

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <label className="mb-1 block text-sm font-semibold text-gray-900">
                Coupon
            </label>
            <div className="flex gap-2">
                <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="SAVE10"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
                />
                <button
                    onClick={() => applyCoupon(code)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Apply
                </button>
            </div>
            {coupon !== null && (
                <p className="mt-1 text-xs text-green-600">
                    Coupon {coupon} applied.
                </p>
            )}
        </div>
    );
};

const ShippingSelector = () => {
    const { shipping, setShipping } = useCart();

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">
                Shipping
            </h3>
            <div className="flex gap-2">
                {(["standard", "express"] as ShippingMethod[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => setShipping(m)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                            shipping === m
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700"
                        }`}
                    >
                        {m === "standard" ? "Standard $5" : "Express $15"}
                    </button>
                ))}
            </div>
        </div>
    );
};

interface CheckoutProps {
    /** Render probe forwarded to the Order Summary, used by tests. */
    onPriceBreakdownRender?: () => void;
}

export const Checkout = ({ onPriceBreakdownRender }: CheckoutProps) => (
    <CartProvider>
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-3xl">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Checkout
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Apply a coupon and watch the total. Type a gift note and
                    watch the render badge.
                </p>
                <div className="grid grid-cols-[1fr_280px] gap-4">
                    <div className="space-y-4">
                        <CartItemList />
                        <CouponForm />
                        <ShippingSelector />
                        <GiftNoteInput />
                    </div>
                    <PriceBreakdown onRender={onPriceBreakdownRender} />
                </div>
            </div>
        </main>
    </CartProvider>
);
