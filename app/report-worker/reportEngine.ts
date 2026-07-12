export const DATASET = Array.from({ length: 50 }, (_, i) => i + 1);

const probe = { mainThreadRuns: 0 };

export const getMainThreadRuns = () => probe.mainThreadRuns;

export const _resetReportEngine = () => {
    probe.mainThreadRuns = 0;
};

// The heavy aggregation — meant to run inside the worker, off the main
// thread. The probe records any time it runs on the thread that imports
// this module (the main thread, in a test).
export const computeTotal = (range: number): number => {
    probe.mainThreadRuns += 1;
    let total = 0;
    for (let i = 1; i <= range; i++) {
        total += DATASET[i - 1] ?? 0;
    }
    return total;
};
