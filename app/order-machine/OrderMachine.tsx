"use client";

import { useMemo, useReducer } from "react";

import { makeInitialOrder, orderReducer } from "./orderReducer";

let NEXT_ITEM = 1;

export const OrderMachine = () => {
    const [order, dispatch] = useReducer(
        orderReducer,
        undefined,
        makeInitialOrder
    );

    // Recompute the subtotal whenever the line items change.
    const subtotal = useMemo(
        () => order.items.reduce((sum, item) => sum + item.price, 0),
        [order.items]
    );

    const addItem = () => {
        const n = NEXT_ITEM++;
        dispatch({
            type: "addItem",
            item: { id: `x-${n}`, name: `Add-on ${n}`, price: 5 },
        });
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md">
                <h2 className="mb-1 text-xl font-semibold text-gray-900">
                    Checkout
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Status:{" "}
                    <span data-testid="order-status" className="font-medium">
                        {order.status}
                    </span>
                </p>

                <ul className="mb-3 space-y-1">
                    {order.items.map((item) => (
                        <li
                            key={item.id}
                            data-testid="line-item"
                            className="flex justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800"
                        >
                            <span>{item.name}</span>
                            <span>${item.price}</span>
                        </li>
                    ))}
                </ul>

                <p className="mb-4 text-sm text-gray-900">
                    Subtotal:{" "}
                    <span data-testid="subtotal" className="font-semibold">
                        ${subtotal}
                    </span>
                </p>

                {order.orderId && (
                    <p className="mb-4 text-xs text-green-700">
                        Order placed:{" "}
                        <span data-testid="order-id">{order.orderId}</span>
                    </p>
                )}

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={addItem}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs"
                    >
                        Add item
                    </button>
                    <button
                        onClick={() => dispatch({ type: "review" })}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs"
                    >
                        Review
                    </button>
                    <button
                        onClick={() =>
                            dispatch({
                                type: "pay",
                                paymentId: `PAY-${Date.now()}`,
                            })
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs"
                    >
                        Pay
                    </button>
                </div>
            </div>
        </main>
    );
};
