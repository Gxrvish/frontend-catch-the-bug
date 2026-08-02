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

    it("notifies for a write three levels down", () => {
        const onChange = vi.fn();
        const config = createReactive(
            { a: { b: { c: 1 } } } as { a: { b: { c: number } } },
            onChange
        );

        config.a.b.c = 2;

        // Depth is not a special case — it is the same rule applied
        // again.
        expect(config.a.b.c).toBe(2);
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("notifies exactly once per nested write", () => {
        const onChange = vi.fn();
        const config = createReactive(makeConfig(), onChange);

        config.theme.density = "compact";

        expect(config.theme.density).toBe("compact");
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("notifies when a nested key is deleted", () => {
        const onChange = vi.fn();
        const config = createReactive(makeConfig(), onChange);

        delete (config.theme as { density?: string }).density;

        expect(config.theme.density).toBeUndefined();
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("tracks writes through an array value", () => {
        const onChange = vi.fn();
        const config = createReactive(
            { tags: ["a"] } as { tags: string[] },
            onChange
        );

        config.tags.push("b");

        expect(config.tags).toEqual(["a", "b"]);
        expect(onChange).toHaveBeenCalled();
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
