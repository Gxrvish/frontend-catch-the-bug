// Collapses a burst of rapid calls into a single trailing call. The
// timer state lives in the closure, so ONE debounce instance must be
// reused across the whole session — recreate it and the collapsing
// resets every time.
export const debounce = <Args extends unknown[]>(
    fn: (...args: Args) => void,
    wait: number
) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return (...args: Args) => {
        if (timer !== null) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            timer = null;
            fn(...args);
        }, wait);
    };
};
