export type FeedOptions = {
    symbols: string[];
};

export type Tick = {
    symbol: string;
    price: number;
};

// Connection accounting — the feed vendor bills per connection, so QA
// tracks exactly how many times the client subscribes.
let connectCount = 0;
let disconnectCount = 0;

export const getConnectCount = () => connectCount;
export const getDisconnectCount = () => disconnectCount;

export const _resetPriceFeed = () => {
    connectCount = 0;
    disconnectCount = 0;
};

// Deterministic replay of the live feed: AAPL ticks 100ms after
// connect, MSFT 300ms after connect.
const SCRIPT: { at: number; tick: Tick }[] = [
    { at: 100, tick: { symbol: "AAPL", price: 187.2 } },
    { at: 300, tick: { symbol: "MSFT", price: 411.65 } },
];

export const connectPriceFeed = (
    options: FeedOptions,
    onTick: (tick: Tick) => void
) => {
    connectCount += 1;
    const timers = SCRIPT.filter((entry) =>
        options.symbols.includes(entry.tick.symbol)
    ).map((entry) => setTimeout(() => onTick(entry.tick), entry.at));

    return () => {
        disconnectCount += 1;
        timers.forEach((timer) => clearTimeout(timer));
    };
};
