// Instrumented DOM access used by the release-board widgets.
//
// The perf team routes every geometry read and every style write through
// this module so a synthetic run can see exactly what the browser was asked
// to do, and in what order. THIS FILE IS THE INSTRUMENT — the bugs are not
// in here.

export type LayoutRect = { top: number; height: number };
export type LayoutOp = "read" | "write";

const rects = new Map<string, LayoutRect>();
const ops: LayoutOp[] = [];

const idOf = (el: HTMLElement) => el.dataset.layoutId ?? "unknown";

/** A geometry read. In a real browser this flushes pending layout. */
export const readRect = (el: HTMLElement): LayoutRect => {
    ops.push("read");
    return rects.get(idOf(el)) ?? { top: 0, height: 0 };
};

/** A style write. In a real browser this invalidates layout. */
export const writeTop = (el: HTMLElement, top: number): void => {
    ops.push("write");
    el.style.top = `${top}px`;
};

export const getOps = (): LayoutOp[] => [...ops];

// test helpers
export const _setRect = (id: string, rect: LayoutRect) => {
    rects.set(id, rect);
};

export const _clearOps = () => {
    ops.length = 0;
};

export const _resetLayout = () => {
    rects.clear();
    ops.length = 0;
};
