// The durable draft vault. THIS IS THE STORAGE — the bugs are not in here.
//
// Like every persistence layer (localStorage, a KV store, a file), it
// stores STRINGS. What goes in is what comes out, byte for byte.

const cells = new Map<string, string>();

export const writeVault = (key: string, value: string): void => {
    cells.set(key, String(value));
};

export const readVault = (key: string): string | null => cells.get(key) ?? null;

export const _resetVault = () => {
    cells.clear();
};
