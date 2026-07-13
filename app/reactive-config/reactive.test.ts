import { describe, expect, it, vi } from "vitest";

import { createReactive } from "./reactive";

type Config = {
    promoCode?: string;
    autosave: boolean;
    theme: { color: string; density: string };
};

const makeConfig = (): Config => ({
    promoCode: "LAUNCH10",
    autosave: true,
    theme: { color: "slate", density: "cozy" },
});

describe("createReactive", () => {
    it("notifies when a nested field changes", () => {
        const onChange = vi.fn();
        const config = createReactive(makeConfig(), onChange);

        config.theme.color = "indigo";

        expect(config.theme.color).toBe("indigo");
        expect(onChange).toHaveBeenCalled();
    });

    it("notifies when a key is deleted", () => {
        const onChange = vi.fn();
        const config = createReactive(makeConfig(), onChange);

        delete config.promoCode;

        expect(config.promoCode).toBeUndefined();
        expect(onChange).toHaveBeenCalledWith("promoCode");
    });

    it("notifies when a top-level field changes", () => {
        const onChange = vi.fn();
        const config = createReactive(makeConfig(), onChange);

        config.autosave = false;

        expect(config.autosave).toBe(false);
        expect(onChange).toHaveBeenCalledWith("autosave");
        expect(onChange).toHaveBeenCalledTimes(1);
    });
});
