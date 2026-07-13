import { beforeEach, describe, expect, it } from "vitest";

import type { Draft } from "./draftStore";
import { loadDraft, minutesSinceEdit, saveDraft } from "./draftStore";
import { _resetVault } from "./vault";

const draft = (overrides: Partial<Draft> = {}): Draft => ({
    title: "Q3 launch plan",
    subtitle: "Rollout",
    tags: new Set(["urgent", "q3"]),
    updatedAt: new Date(1_700_000_000_000),
    ...overrides,
});

describe("draftStore", () => {
    beforeEach(() => {
        _resetVault();
    });

    it("revives the edit timestamp as a date", () => {
        saveDraft(draft());

        const restored = loadDraft();
        expect(restored).not.toBeNull();

        const now = 1_700_000_000_000 + 5 * 60_000;
        expect(() => minutesSinceEdit(restored!, now)).not.toThrow();
        expect(minutesSinceEdit(restored!, now)).toBe(5);
    });

    it("round-trips the tag set", () => {
        saveDraft(draft());

        const restored = loadDraft();

        expect(restored?.tags).toBeInstanceOf(Set);
        expect([...(restored?.tags ?? [])].sort()).toEqual(["q3", "urgent"]);
    });

    it("keeps a deliberately removed subtitle removed", () => {
        // The author deleted the section header — that choice must survive
        // the round-trip, not get replaced by the default.
        saveDraft(draft({ subtitle: undefined }));

        const restored = loadDraft();

        expect(restored?.subtitle).toBeUndefined();
    });

    it("round-trips the title", () => {
        saveDraft(draft());

        expect(loadDraft()?.title).toBe("Q3 launch plan");
    });
});
