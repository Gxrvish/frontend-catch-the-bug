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

    it("round-trips a plain invite", () => {
        const state = { team: "atlas", seats: 3 };

        expect(decodeInvite(encodeInvite(state))).toEqual(state);
    });
});
