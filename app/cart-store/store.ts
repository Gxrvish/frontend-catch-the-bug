export type CartItem = {
    id: string;
    qty: number;
};

export type CartState = {
    count: number;
    items: CartItem[];
};

type Listener = () => void;

const seed = (): CartState => ({
    count: 0,
    items: [
        { id: "a", qty: 2 },
        { id: "b", qty: 0 },
    ],
});

let state: CartState = seed();
const listeners = new Set<Listener>();

export const getState = (): CartState => state;

export const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

export const listenerCount = () => listeners.size;

// Apply an update to the store, then wake every subscriber. Callers send
// the slice they touched and we swap it in.
export const setState = (partial: Partial<CartState>) => {
    state = partial as CartState;
    listeners.forEach((listener) => listener());
};

export const addItem = (id: string, qty: number) =>
    setState({ items: [...state.items, { id, qty }] });

export const increment = () => setState({ count: state.count + 1 });

export const _resetStore = () => {
    state = seed();
    listeners.clear();
};
