import type { ConnectionSnapshot } from "./connectionStatus.types";

type Listener = () => void;

let state: ConnectionSnapshot = { online: true, latencyMs: 42, checks: 0 };
const listeners = new Set<Listener>();

// What the server renders: the probe never runs during SSR, so the pill
// starts from a fixed baseline.
const SERVER_SNAPSHOT: ConnectionSnapshot = {
    online: true,
    latencyMs: 0,
    checks: 0,
};

const notify = () => {
    listeners.forEach((listener) => listener());
};

export const connectionStore = {
    subscribe(listener: Listener) {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
    // Hand each consumer a fresh copy of the state, so no component can
    // reach in and mutate the store's internals through the snapshot.
    getSnapshot(): ConnectionSnapshot {
        return { ...state };
    },
    getServerSnapshot(): ConnectionSnapshot {
        return SERVER_SNAPSHOT;
    },
    setOnline(online: boolean) {
        state = { ...state, online, checks: state.checks + 1 };
        notify();
    },
    recordPing(latencyMs: number) {
        state = { ...state, latencyMs, checks: state.checks + 1 };
        notify();
    },
    _reset() {
        state = { online: true, latencyMs: 42, checks: 0 };
    },
};
