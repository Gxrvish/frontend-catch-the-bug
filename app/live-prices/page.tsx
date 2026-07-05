"use client";

import { StrictMode } from "react";

import { LivePrices } from "./LivePrices";

// StrictMode is explicit here (not just inherited from dev config) because
// the whole point of this problem is what StrictMode reveals.
const LivePricesPage = () => (
    <StrictMode>
        <LivePrices />
    </StrictMode>
);

export default LivePricesPage;
