import { describe, expect, it } from "vitest";

import { ordinal, relativeDays } from "./captions";

const DAY_MS = 86_400_000;
const NOW = 1_700_000_000_000;

describe("captions", () => {
    it("uses English ordinal rules for every rank", () => {
        expect(ordinal(21)).toBe("21st");
        expect(ordinal(22)).toBe("22nd");
        expect(ordinal(23)).toBe("23rd");
        // …but the teens are exceptions to the exceptions.
        expect(ordinal(11)).toBe("11th");
        expect(ordinal(12)).toBe("12th");
        expect(ordinal(13)).toBe("13th");
        expect(ordinal(111)).toBe("111th");
    });

    it("describes past events as ago, not negative-future", () => {
        expect(relativeDays(NOW - 2 * DAY_MS, NOW)).toBe("2 days ago");
    });

    it("keeps the rule going past 100", () => {
        expect(ordinal(101)).toBe("101st");
        expect(ordinal(102)).toBe("102nd");
        expect(ordinal(103)).toBe("103rd");
        expect(ordinal(112)).toBe("112th");
        expect(ordinal(113)).toBe("113th");
        expect(ordinal(121)).toBe("121st");
    });

    it("gets the day plural right in both directions", () => {
        // Flipping the sign by hand fixes the wording and leaves the
        // grammar behind.
        expect(relativeDays(NOW - DAY_MS, NOW)).toBe("1 day ago");
        expect(relativeDays(NOW + DAY_MS, NOW)).toBe("in 1 day");
        expect(relativeDays(NOW, NOW)).toBe("in 0 days");
    });

    it("keeps the basics right", () => {
        expect(ordinal(1)).toBe("1st");
        expect(ordinal(4)).toBe("4th");
        expect(relativeDays(NOW + 2 * DAY_MS, NOW)).toBe("in 2 days");
    });
});
