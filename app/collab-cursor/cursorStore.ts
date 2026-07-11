export type Cursor = {
    peerId: string;
    name: string;
    x: number;
    y: number;
};

type Listener = () => void;

// Module-singleton multiplayer cursor store. Real builds wire this to a
// websocket; here moves are dispatched synchronously so tests are
// deterministic. getSnapshot() returns a cached array whose identity only
// changes when the data changes, so any correct subscriber agrees.
const PEERS: Cursor[] = [
    { peerId: "p-1", name: "Mira", x: 40, y: 60 },
    { peerId: "p-2", name: "Jonas", x: 120, y: 30 },
    { peerId: "me", name: "You", x: 10, y: 10 },
];

let cursors = new Map<string, Cursor>(PEERS.map((c) => [c.peerId, { ...c }]));
let snapshot: Cursor[] = [...cursors.values()];
let moveCount = 0;
const listeners = new Set<Listener>();

export const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

export const getSnapshot = (): Cursor[] => snapshot;

export const getMoveCount = () => moveCount;

export const moveCursor = (peerId: string, x: number, y: number) => {
    const current = cursors.get(peerId);
    if (!current) {
        return;
    }
    moveCount += 1;
    cursors.set(peerId, { ...current, x, y });
    snapshot = [...cursors.values()];
    listeners.forEach((listener) => listener());
};

export const _resetCursorStore = () => {
    cursors = new Map(PEERS.map((c) => [c.peerId, { ...c }]));
    snapshot = [...cursors.values()];
    moveCount = 0;
    listeners.clear();
};
