import { beforeEach, describe, expect, it } from "vitest";

import { _dumpNotes, _resetIdb, _seedNote } from "./idb";
import {
    _resetNotesDb,
    getAllNotes,
    getPinnedNotes,
    saveNote,
} from "./notesDb";

describe("offline notes", () => {
    beforeEach(() => {
        _resetNotesDb();
        _resetIdb();
    });

    it("persists a saved note within one transaction", async () => {
        await saveNote("Buy milk");

        expect(_dumpNotes().map((row) => row.text)).toContain("Buy milk");
    });

    it("can query pinned notes through the index", async () => {
        _seedNote({ id: 1, text: "Pinned", pinned: true });
        _seedNote({ id: 2, text: "Loose", pinned: false });

        const pinned = await getPinnedNotes();

        expect(pinned.map((row) => row.text)).toEqual(["Pinned"]);
    });

    it("reads back all notes the read actually fetched", async () => {
        _seedNote({ id: 1, text: "One", pinned: false });
        _seedNote({ id: 2, text: "Two", pinned: false });

        const notes = await getAllNotes();

        expect(notes).toHaveLength(2);
    });

    it("round-trips two notes in insertion order", async () => {
        await saveNote("first");
        await saveNote("second");

        const notes = await getAllNotes();
        expect(notes.map((row) => row.text)).toEqual(["first", "second"]);
    });
});
