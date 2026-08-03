"use client";

import { memo, useMemo, useRef } from "react";

import { useCart } from "./CartContext";
import { computeTotals, formatMoney } from "./checkoutUtils";

interface PriceBreakdownProps {
    /** Render probe used by tests and the on-screen badge. */
    onRender?: () => void;
}

/**
 * Wrapped in memo() because recomputing the breakdown is expensive at our
 * cart sizes — this component must only render when pricing inputs change.
 */
export const PriceBreakdown = memo(({ onRender }: PriceBreakdownProps) => {
    const { items, coupon, shipping } = useCart();

    const renderCount = useRef(0);
    renderCount.current += 1;
    onRender?.();

    const totals = useMemo(
        () => computeTotals(items, coupon, shipping),
        [items, coupon, shipping]
    );

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                    Order Summary
                </h3>
                <span className="rounded bg-purple-100 px-2 py-0.5 font-mono text-xs text-purple-700">
                    renders: {renderCount.current}
                </span>
            </div>
            <dl className="space-y-1 text-sm text-gray-700">
                <div className="flex justify-between">
                    <dt>Subtotal</dt>
                    <dd>{formatMoney(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                    <dt>Discount {coupon !== null && `(${coupon})`}</dt>
                    <dd className="text-green-600">
                        −{formatMoney(totals.discount)}
                    </dd>
                </div>
                <div className="flex justify-between">
                    <dt>Shipping</dt>
                    <dd>{formatMoney(totals.shippingCost)}</dd>
                </div>
                <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900">
                    <dt>Total</dt>
                    <dd data-testid="total-amount">
                        {formatMoney(totals.total)}
                    </dd>
                </div>
            </dl>
        </div>
    );
});

PriceBreakdown.displayName = "PriceBreakdown";
