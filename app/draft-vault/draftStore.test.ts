import { beforeEach, describe, expect, it } from "vitest";

import type { Draft } from "./draftStore";
import { loadDraft, minutesSinceEdit, saveDraft } from "./draftStore";
import { _resetVault, readVault, writeVault } from "./vault";

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

    it("round-trips a draft with no tags at all", () => {
        saveDraft(draft({ tags: new Set() }));

        const restored = loadDraft();

        // An empty set is still a set — not a plain object, not the
        // tags from some default.
        expect(restored?.tags).toBeInstanceOf(Set);
        expect(restored?.tags.size).toBe(0);
    });

    it("keeps a deliberately removed subtitle removed", () => {
        // The author deleted the section header — that choice must survive
        // the round-trip, not get replaced by the default.
        saveDraft(draft({ subtitle: undefined }));

        const restored = loadDraft();

        expect(restored?.subtitle).toBeUndefined();
    });

    it("tells a removed subtitle apart from an empty one", () => {
        saveDraft(draft({ subtitle: "" }));
        expect(loadDraft()?.subtitle).toBe("");

        saveDraft(draft({ subtitle: undefined }));
        expect(loadDraft()?.subtitle).toBeUndefined();

        saveDraft(draft({ subtitle: "Rollout" }));
        expect(loadDraft()?.subtitle).toBe("Rollout");
    });

    it("restores from nothing but the stored string", () => {
        saveDraft(draft());
        const raw = readVault("draft");
        expect(typeof raw).toBe("string");

        // Everything the vault didn't keep is gone — no in-memory copy
        // of the draft can stand in for the serialization.
        _resetVault();
        writeVault("draft", raw!);
        const restored = loadDraft();

        expect(restored?.updatedAt).toBeInstanceOf(Date);
        expect(restored?.tags).toBeInstanceOf(Set);
        expect([...(restored?.tags ?? [])].sort()).toEqual(["q3", "urgent"]);
        expect(restored?.title).toBe("Q3 launch plan");
    });

    it("leaves the draft it was handed untouched", () => {
        const original = draft();
        saveDraft(original);

        expect(original.updatedAt).toBeInstanceOf(Date);
        expect(original.tags).toBeInstanceOf(Set);
        expect(loadDraft()?.updatedAt).toBeInstanceOf(Date);
    });

    it("returns null when nothing has been backed up", () => {
        expect(loadDraft()).toBeNull();

        saveDraft(draft());
        expect(loadDraft()?.updatedAt).toBeInstanceOf(Date);
    });

    it("round-trips the title", () => {
        saveDraft(draft());

        expect(loadDraft()?.title).toBe("Q3 launch plan");
    });
});
