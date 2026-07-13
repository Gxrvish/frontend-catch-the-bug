// The upload transport. THIS IS THE NETWORK — the bugs are not in here.
//
// Requests never settle on their own: a test (or the "Easy Repro" panel)
// drives them with _complete / _fail. The transport records how many
// requests were open at once and which ones were aborted, so a synthetic run
// can see what the app actually did to the network.

type Pending = {
    resolve: () => void;
    reject: (error: unknown) => void;
};

const pending = new Map<string, Pending>();
const probe = {
    inFlight: 0,
    maxInFlight: 0,
    aborted: [] as string[],
};

export type UploadOptions = { signal?: AbortSignal };

export const uploadFile = (name: string, options: UploadOptions = {}) =>
    new Promise<void>((resolve, reject) => {
        probe.inFlight += 1;
        probe.maxInFlight = Math.max(probe.maxInFlight, probe.inFlight);

        const settle = (finish: () => void) => {
            if (!pending.has(name)) return;
            pending.delete(name);
            probe.inFlight -= 1;
            finish();
        };

        pending.set(name, {
            resolve: () => settle(resolve),
            reject: (error) => settle(() => reject(error)),
        });

        options.signal?.addEventListener("abort", () => {
            if (!pending.has(name)) return;
            probe.aborted.push(name);
            pending
                .get(name)
                ?.reject(
                    new DOMException("The upload was aborted.", "AbortError")
                );
        });
    });

// drivers
export const _complete = (name: string) => pending.get(name)?.resolve();
export const _fail = (name: string) =>
    pending.get(name)?.reject(new Error(`Upload failed: ${name}`));

// probes
export const getInFlight = () => [...pending.keys()];
export const getMaxInFlight = () => probe.maxInFlight;
export const getAborted = () => [...probe.aborted];

export const _resetUploadApi = () => {
    pending.clear();
    probe.inFlight = 0;
    probe.maxInFlight = 0;
    probe.aborted = [];
};
