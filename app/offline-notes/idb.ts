// A small, faithful fake of the browser IndexedDB surface — just enough
// of the request/transaction lifecycle to reproduce real IDB footguns
// deterministically (jsdom ships no IndexedDB). Do not "fix" bugs here;
// this is the database. The app code lives in notesDb.ts.

export type NoteRow = {
    id: number;
    text: string;
    pinned: boolean;
};

type Backing = {
    rows: NoteRow[];
    autoId: number;
    stores: Set<string>;
    indexes: Set<string>;
};

let db: Backing = {
    rows: [],
    autoId: 1,
    stores: new Set(),
    indexes: new Set(),
};

export class FakeRequest<T> {
    result: T | undefined = undefined;
    error: unknown = undefined;
    onsuccess: (() => void) | null = null;
    onerror: (() => void) | null = null;

    constructor(value: T) {
        // The result is only available once onsuccess fires — one turn
        // later, exactly like a real IDBRequest.
        queueMicrotask(() => {
            this.result = value;
            this.onsuccess?.();
        });
    }
}

export const requestToPromise = <T>(request: FakeRequest<T>): Promise<T> =>
    new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () =>
            reject(request.error ?? new Error("request failed"));
    });

class FakeIndex {
    constructor(
        private tx: FakeTransaction,
        private name: string
    ) {}

    getAll(pinned: boolean): FakeRequest<NoteRow[]> {
        this.tx.assertActive();
        return new FakeRequest(db.rows.filter((row) => row.pinned === pinned));
    }
}

class FakeObjectStore {
    constructor(private tx: FakeTransaction) {}

    put(row: {
        id?: number;
        text: string;
        pinned?: boolean;
    }): FakeRequest<number> {
        this.tx.assertActive();
        if (this.tx.mode !== "readwrite") {
            throw new DOMException(
                "The transaction is read-only.",
                "ReadOnlyError"
            );
        }
        const id = row.id ?? db.autoId++;
        const full: NoteRow = { pinned: false, ...row, id };
        const at = db.rows.findIndex((r) => r.id === id);
        if (at >= 0) {
            db.rows[at] = full;
        } else {
            db.rows.push(full);
        }
        return new FakeRequest(id);
    }

    getAll(): FakeRequest<NoteRow[]> {
        this.tx.assertActive();
        return new FakeRequest([...db.rows]);
    }

    index(name: string): FakeIndex {
        if (!db.indexes.has(name)) {
            throw new DOMException(
                `No index named '${name}' in the object store.`,
                "NotFoundError"
            );
        }
        return new FakeIndex(this.tx, name);
    }
}

class FakeTransaction {
    active = true;
    done: Promise<void>;

    constructor(
        private storeName: string,
        public mode: "readonly" | "readwrite"
    ) {
        this.done = new Promise((resolve) => {
            // A transaction is only active for the current task turn; once
            // control returns to the event loop it deactivates and commits.
            queueMicrotask(() => {
                this.active = false;
                resolve();
            });
        });
    }

    assertActive() {
        if (!this.active) {
            throw new DOMException(
                "The transaction has finished.",
                "TransactionInactiveError"
            );
        }
    }

    objectStore(name: string): FakeObjectStore {
        if (name !== this.storeName) {
            throw new DOMException(
                `Object store '${name}' is not in this transaction's scope.`,
                "NotFoundError"
            );
        }
        return new FakeObjectStore(this);
    }
}

export class FakeUpgradeStore {
    createIndex(name: string) {
        db.indexes.add(name);
    }
}

export class FakeDB {
    createObjectStore(name: string): FakeUpgradeStore {
        db.stores.add(name);
        return new FakeUpgradeStore();
    }

    transaction(
        name: string,
        mode: "readonly" | "readwrite" = "readonly"
    ): FakeTransaction {
        if (!db.stores.has(name)) {
            throw new DOMException(
                `No object store named '${name}'.`,
                "NotFoundError"
            );
        }
        return new FakeTransaction(name, mode);
    }
}

let opened: FakeDB | null = null;

// Open (and, on first open, upgrade) the database. Mirrors
// indexedDB.open + onupgradeneeded.
export const openDB = async (
    upgrade: (db: FakeDB) => void
): Promise<FakeDB> => {
    if (!opened) {
        opened = new FakeDB();
        upgrade(opened);
    }
    return opened;
};

// --- test/inspection helpers (not part of the IDB surface) ---

export const _seedNote = (row: NoteRow) => {
    db.rows.push(row);
    db.autoId = Math.max(db.autoId, row.id + 1);
};

export const _dumpNotes = (): NoteRow[] => [...db.rows];

export const _resetIdb = () => {
    db = { rows: [], autoId: 1, stores: new Set(), indexes: new Set() };
    opened = null;
};
