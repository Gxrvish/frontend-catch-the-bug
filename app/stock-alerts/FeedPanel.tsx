import { useEffect } from "react";

import { connectPriceFeed, type FeedOptions, type Tick } from "./priceFeed";

export const FeedPanel = ({
    options,
    onAlert,
}: {
    options: FeedOptions;
    onAlert: (tick: Tick) => void;
}) => {
    useEffect(
        () => connectPriceFeed(options, onAlert),
        // Keeping both inputs in the deps keeps the subscription honest:
        // whenever the watch config or the handler changes, we reconnect.
        [options, onAlert]
    );

    return (
        <p className="mb-3 text-xs text-gray-500">
            Feed status: <span className="text-green-600">live</span> · watching{" "}
            {options.symbols.join(", ")}
        </p>
    );
};
