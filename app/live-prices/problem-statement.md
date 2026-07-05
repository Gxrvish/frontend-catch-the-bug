# Live Prices Double Delivery Problem Statement

## Context

The ticker subscribes to a market-data socket (`pricesApi.ts`) and shows the
latest price per symbol plus an "updates received" counter. The socket is a
process-wide connection; components attach and detach listeners in an
effect. The page renders under `<StrictMode>` on purpose.

A trading-platform scale company's bug ticket: "In dev, every tick is
counted twice and the update counter runs exactly 2× the tick rate. QA also
saw the socket listener count sit at 2 with a single ticker on screen. In
prod it looks fine — today. The same code duplicated real orders in a past
incident, so 'fine in prod' is not closing this ticket."

## Problem

The subscription effect leaks. Its cleanup runs, throws no error, and
removes nothing. StrictMode's deliberate mount → cleanup → remount cycle
exposes the leak immediately: after mounting once, **two** live listeners
exist, so every update is processed twice.

## Failure Scenario

1. Page mounts in dev; StrictMode runs the effect, its cleanup, then the
   effect again.
2. Cleanup silently fails to detach the first listener.
3. Both listeners now receive every tick: counter +2 per tick, and the
   "socket listeners" badge shows 2.
4. Any future remount (route change and back, HMR, Suspense retry) adds
   another immortal listener: 3, 4, 5…

## Fast Reproduction Path

1. `npm run dev`, open `/live-prices`.
2. Read the "socket listeners" badge — 2 with a single component on screen.
3. Click "Emit one market tick" once; "updates received" jumps by 2.
4. `LivePrices.test.tsx` encodes the fix: after a StrictMode mount, listener
   count is 1 and one tick produces exactly one update.

## Root Cause Summary

An effect's cleanup must undo *exactly* what the effect did. This effect
registers one function with the socket and asks the socket to remove a
*different* one — the removal is a set-delete of a reference that was never
in the set, so it silently does nothing. Look very carefully at what value
is passed to `priceSocket.on(...)` and what value is passed to
`priceSocket.off(...)`, and ask whether they can ever be `===`.

StrictMode is not the bug and must stay. React double-invokes effects in dev
precisely to make non-symmetric effects like this one loud before they reach
production.

## Requirements for the Fix

- After mounting under StrictMode: exactly 1 socket listener, and one tick
  increments the counter by exactly 1 (encoded in `LivePrices.test.tsx`).
- Ticks must still update the price table (also encoded).
- Do not remove `<StrictMode>`, do not guard with an `isSubscribed` ref, do
  not debounce the counter — fix the cleanup symmetry itself. Research
  topics: why StrictMode double-invokes effects (react.dev "My Effect runs
  twice"), effect cleanup contracts, function identity and `Set` semantics,
  `useSyncExternalStore` as the purpose-built API for external
  subscriptions.
