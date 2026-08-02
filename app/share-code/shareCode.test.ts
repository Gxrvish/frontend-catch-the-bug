import { describe, expect, it } from "vitest";

import {
    decodeInvite,
    encodeInvite,
    inviteFromUrl,
    inviteUrl,
} from "./shareCode";

describe("shareCode", () => {
    it("encodes team names beyond latin-1", () => {
        const state = { team: "Launch 🚀 crew", seats: 8 };

        expect(() => encodeInvite(state)).not.toThrow();
        expect(decodeInvite(encodeInvite(state))).toEqual(state);
    });

    it("survives the trip through a URL", () => {
        // This team name's code contains base64 characters that query
        // strings treat as syntax.
        const state = { team: "qa~lab", seats: 5 };

        expect(inviteFromUrl(inviteUrl(state))).toEqual(state);
    });

    it("encodes every kind of non-latin-1 name", () => {
        for (const team of [
            "設計チーム",
            "Ωmega squad",
            "café ☕ crew",
            "אבטחה",
            "e\u0301quipe",
        ]) {
            const state = { team, seats: 4 };
            expect(() => encodeInvite(state)).not.toThrow();
            expect(decodeInvite(encodeInvite(state))).toEqual(state);
        }
    });

    it("survives the URL trip for codes containing + and /", () => {
        // "team ~aa" encodes with a "+", "team ?aa" with a "/" — both are
        // syntax inside a query string.
        for (const team of ["team ~aa", "team ?aa"]) {
            const state = { team, seats: 7 };
            expect(inviteFromUrl(inviteUrl(state))).toEqual(state);
        }
    });

    it("handles the empty edges", () => {
        const state = { team: "", seats: 0 };

        expect(decodeInvite(encodeInvite(state))).toEqual(state);
        expect(inviteFromUrl(inviteUrl(state))).toEqual(state);
        // Seats stay a number, not the string JSON round-trips to.
        expect(typeof inviteFromUrl(inviteUrl(state)).seats).toBe("number");
    });

    it("round-trips a plain invite", () => {
        const state = { team: "atlas", seats: 3 };

        expect(decodeInvite(encodeInvite(state))).toEqual(state);
    });
});
