export type CellId = string;

export type Grid = Record<CellId, { raw: string }>;

export const CELL_IDS: CellId[] = [
    "A1",
    "B1",
    "C1",
    "A2",
    "B2",
    "C2",
    "A3",
    "B3",
    "C3",
];

const cache = new Map<string, number>();

export const _resetEngine = () => {
    cache.clear();
};

// Evaluates a cell to a number. Formulas start with "=" and are simple
// "+"-separated sums of cell refs and literals; anything else is a
// literal number. Throws on a reference cycle (see below).
export const evaluate = (cellId: CellId, grid: Grid): number => {
    const raw = grid[cellId]?.raw ?? "";
    if (!raw.startsWith("=")) {
        const n = Number(raw);
        return Number.isNaN(n) ? 0 : n;
    }

    const formula = raw.slice(1);

    // Same formula, same result — so we cache on the formula text and
    // skip the work next time we meet it.
    if (cache.has(formula)) {
        return cache.get(formula)!;
    }

    const terms = formula.split("+").map((term) => term.trim());
    let total = 0;
    for (const term of terms) {
        if (/^[A-C][1-3]$/.test(term)) {
            // References always bottom out at a literal eventually, so we
            // can just recurse into them.
            total += evaluate(term, grid);
        } else {
            const n = Number(term);
            total += Number.isNaN(n) ? 0 : n;
        }
    }

    cache.set(formula, total);
    return total;
};
