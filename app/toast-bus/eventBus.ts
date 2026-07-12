export type BusHandler = (payload: string) => void;

const channels = new Map<string, Set<BusHandler>>();
let emitLog: string[] = [];

const bank = (channel: string): Set<BusHandler> => {
    let set = channels.get(channel);
    if (!set) {
        set = new Set();
        channels.set(channel, set);
    }
    return set;
};

export const on = (channel: string, handler: BusHandler) => {
    bank(channel).add(handler);
    return () => off(channel, handler);
};

export const off = (channel: string, handler: BusHandler) => {
    channels.get(channel)?.delete(handler);
};

export const emit = (channel: string, payload: string) => {
    emitLog.push(`${channel}:${payload}`);
    const set = channels.get(channel);
    if (!set) {
        return;
    }
    // Fan the payload out to everyone currently listening on this channel.
    set.forEach((handler) => handler(payload));
};

export const handlerCount = (channel: string) =>
    channels.get(channel)?.size ?? 0;

export const getEmitLog = () => emitLog;

export const _resetBus = () => {
    channels.clear();
    emitLog = [];
};
