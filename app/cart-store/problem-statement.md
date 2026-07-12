# Cart Store Problem Statement

## Context

The cart is backed by a tiny external store (`store.ts`) — `getState`,
`subscribe`, `setState` — consumed through a hand-rolled `useStore(selector)`
hook (`useStore.ts`). Widgets across the app read slices of it. Three
tickets from a performance review.

## Ticket A — "The badge re-renders on everything"

The active-items badge re-renders on *every* store change, even ones that
don't affect its number — adding an out-of-stock slot, bumping an
unrelated counter, anything. On a busy cart page the badge is the hottest
component in the profiler, re-rendering dozens of times for no visible
change.

## Ticket B — "Unmounted widgets keep listening"

Open and close the cart drawer a few times and the store's subscriber
list keeps growing — old, unmounted badges are still subscribed. They
fire setState into components React has already thrown away (dev warns
about it), and the leak compounds the longer the session runs.

## Ticket C — "Updating one field wipes the others"

Bumping the click counter blows away the cart items; adding an item
resets the count. Any `setState` of one slice erases every other slice.

## Fast Reproduction Path

1. Open `/cart-store`.
2. Click **Add empty slot** — the badge re-renders though "Active items"
   is unchanged (Ticket A).
3. Mount/unmount the badge — `listenerCount()` never returns to 0
   (Ticket B).
4. Click **Increment** — the cart items vanish (Ticket C).

## Root Cause Hints

- **A:** the badge selects `state.items.filter(i => i.qty > 0)` — a brand
  **new array every call**. The hook stores that in `useState` and
  `setValue`s the fresh array on every notification, so `Object.is` never
  matches and the component always re-renders. Select a *stable*,
  comparable value (the derived count/primitive) — or a slice with an
  equality function — so unchanged results bail out of rendering.
- **B:** `subscribe` returns an unsubscribe function, but the hook's
  `useEffect` never returns it as cleanup, so the listener outlives the
  component. An effect that subscribes must return the unsubscribe.
- **C:** `setState` does `state = partial` — it *replaces* the whole
  state with whatever slice the caller passed, dropping the rest. A
  partial update has to be merged onto the current state
  (`{ ...state, ...partial }`).

## Requirements for the Fix

- An update that doesn't change the badge's value doesn't re-render it
  (Red A).
- Unmounting a widget removes its subscription — `listenerCount()`
  returns to 0 (Red B).
- Updating one slice preserves the others (Red C).
- A change that *does* affect the badge still updates it (guard).
- Don't defeat A by freezing the badge so it stops updating. Research
  topics: selector granularity and referential stability in external
  stores, `useSyncExternalStore` and selector equality, effect cleanup
  for subscriptions, immutable partial-state merges.
