import { readVault, writeVault } from "./vault";

export type Draft = {
    title: string;
    /** undefined = the author removed the section header on purpose. */
    subtitle: string | undefined;
    tags: Set<string>;
    updatedAt: Date;
};

const DEFAULTS = {
    title: "",
    subtitle: "Untitled section",
};

export const saveDraft = (draft: Draft): void => {
    // The vault takes strings, so serialize the draft wholesale.
    writeVault("draft", JSON.stringify(draft));
};

export const loadDraft = (): Draft | null => {
    const raw = readVault("draft");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Draft;
    // Backfill anything the stored draft doesn't specify.
    return { ...DEFAULTS, ...parsed };
};

/** Whole minutes since the draft was last edited. */
export const minutesSinceEdit = (draft: Draft, now: number): number =>
    Math.round((now - draft.updatedAt.getTime()) / 60_000);
