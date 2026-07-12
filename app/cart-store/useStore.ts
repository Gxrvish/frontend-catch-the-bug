import { useEffect, useState } from "react";

import { type CartState, getState, subscribe } from "./store";

// Subscribe a component to the cart store through a selector. Seed from
// the current state, then re-read whenever the store changes.
export const useStore = <T>(selector: (state: CartState) => T): T => {
    const [value, setValue] = useState<T>(() => selector(getState()));

    useEffect(() => {
        const unsubscribe = subscribe(() => setValue(selector(getState())));
        // The store is a session-long singleton, so there's nothing to
        // tear down when one widget unmounts — the subscription can stay.
        void unsubscribe;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return value;
};
