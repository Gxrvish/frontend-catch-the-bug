import { createContext, useContext } from "react";

import type { StudioContextValue } from "./designStudio.types";

export const StudioContext = createContext<StudioContextValue | null>(null);

export const useStudio = () => {
    const ctx = useContext(StudioContext);
    if (!ctx) {
        throw new Error("useStudio must be used inside the studio provider");
    }
    return ctx;
};
