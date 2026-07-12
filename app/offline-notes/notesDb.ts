import {
    _resetIdb,
    type FakeDB,
    type NoteRow,
    openDB,
    requestToPromise,
} from "./idb";

let dbPromise: Promise<FakeDB> | null = null;

const getDb = () => {
    if (!dbPromise) {
        dbPromise = openDB((db) => {
            // First run: stand up the notes store.
            const store = db.createObjectStore("notes");
            void store;
        });
    }
    return dbPromise;
};

// Normalize a note before it goes to disk.
const normalize = async (
    text: string
): Promise<{ text: string; pinned: boolean }> => ({
    text: text.trim(),
    pinned: false,
});

export const saveNote = async (text: string): Promise<void> => {
    const db = await getDb();
    const tx = db.transaction("notes", "readwrite");
    const store = tx.objectStore("notes");
    // Clean the note up, then write the result.
    const row = await normalize(text);
    store.put(row);
    await tx.done;
};

export const getAllNotes = async (): Promise<NoteRow[]> => {
    const db = await getDb();
    const tx = db.transaction("notes", "readonly");
    const request = tx.objectStore("notes").getAll();
    // Hand back the rows the read just fetched.
    return (request.result ?? []) as NoteRow[];
};

export const getPinnedNotes = async (): Promise<NoteRow[]> => {
    const db = await getDb();
    const tx = db.transaction("notes", "readonly");
    const index = tx.objectStore("notes").index("byPinned");
    return requestToPromise(index.getAll(true));
};

export const _resetNotesDb = () => {
    dbPromise = null;
    _resetIdb();
};
