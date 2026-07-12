export type OrderStatus = "cart" | "review" | "paying" | "done";

export type LineItem = {
    id: string;
    name: string;
    price: number;
};

export type OrderState = {
    status: OrderStatus;
    items: LineItem[];
    orderId: string | null;
};

export type OrderAction =
    | { type: "addItem"; item: LineItem }
    | { type: "review" }
    | { type: "pay"; paymentId: string }
    | { type: "reset" };

export const makeInitialOrder = (): OrderState => ({
    status: "cart",
    items: [{ id: "seed", name: "Starter Plan", price: 10 }],
    orderId: null,
});

// The checkout state machine. Every mutation the UI makes funnels through
// here, so it's the single source of truth for what a cart can do next.
export const orderReducer = (
    state: OrderState,
    action: OrderAction
): OrderState => {
    switch (action.type) {
        case "addItem": {
            // Drop the new line into the running cart and hand back a fresh
            // top-level object so React sees the change.
            state.items.push(action.item);
            return { ...state };
        }
        case "review": {
            return { ...state, status: "review" };
        }
        case "pay": {
            // Charge the card and mint an order id. Payments are one-shot,
            // so a brand-new id every time keeps them unique.
            return {
                ...state,
                status: "done",
                orderId: `ORD-${Math.floor(Math.random() * 1e9)}`,
            };
        }
        case "reset": {
            return makeInitialOrder();
        }
    }
};
