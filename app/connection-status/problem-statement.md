# Connection Status Infinite Loop Problem Statement

## Context

The status pill reads from a hand-rolled external store
(`connectionStore.ts`) through `useSyncExternalStore`: `subscribe`,
`getSnapshot`, and `getServerSnapshot`, exactly as the React docs describe.
The store itself updates immutably and notifies listeners — its unit tests
pass.

QA ticket from an infra-tooling scale company: "The status page dies on
load, every load. Console: _'Maximum update depth exceeded'_ — and above it,
React says _'The result of getSnapshot should be cached to avoid an
infinite loop'_. The store's own tests are green, so people keep bouncing
the ticket between the store team and the UI team."

## Problem

Mounting `ConnectionStatus` throws. Not on interaction — on mount. The
component renders, React immediately schedules another render, and another,
until it hits its update-depth ceiling and crashes the tree. Nothing about
the _data_ ever changed.

## Failure Scenario

1. Open `/connection-status`. The server-rendered HTML flashes.
2. During hydration, React starts render-looping and throws
   `Maximum update depth exceeded`.
3. The same crash reproduces in a plain client render (see the test).

## Fast Reproduction Path

1. Open `/connection-status` — crash on every load.
2. The console warning names the exact function React is unhappy with, and
   even tells you the required remedy in six words.
3. `ConnectionStatus.test.tsx` encodes the fix: mounting must render the
   pill without throwing.

## Root Cause Summary

After every render, `useSyncExternalStore` calls `getSnapshot` again and
compares the result with the previous one (by `Object.is`) to decide whether
the store changed while React wasn't looking. That check only works if an
_unchanged_ store returns the _same_ snapshot. Read `getSnapshot` in
`connectionStore.ts` and the well-intentioned comment above it, then ask
what two consecutive calls return when nothing has changed — and what React
concludes from that. The store's contract with React is stricter than "give
me the current state": it is "give me a _stable value_ that only changes
identity when the state actually changes".

## Requirements for the Fix

- Mounting `ConnectionStatus` must render the pill without crashing —
  encoded in `ConnectionStatus.test.tsx`.
- The store's observable behavior (subscribe/notify/state transitions,
  including the `checks` counter) must keep working — the store unit test
  stays green.
- Fix the store, not the component — the component uses
  `useSyncExternalStore` correctly. Research topics: the
  `useSyncExternalStore` contract (snapshot immutability + referential
  stability), why the contract exists (tearing in concurrent rendering),
  how zustand/redux satisfy it for free, `getServerSnapshot` and SSR.
