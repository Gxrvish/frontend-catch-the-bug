# Toast Bus Problem Statement

## Context

Toasts and alerts are delivered through a decoupled pub/sub bus
(`eventBus.ts`): `on(channel, handler)` returns an unsubscribe token,
`emit(channel, payload)` fans out to every subscriber. Components publish
and subscribe without knowing about each other. Three tickets.

## Ticket A — "One save, three toasts"

The toast hub shows *more* toasts than were published — the count keeps
climbing the longer the page has been open. Publish twice and you get
three toasts; publish again and you get more. It's as if the hub
registers a new listener every time it renders.

## Ticket B — "The bell keeps listening after it's gone"

Toggle the notification bell off and the bus still has its listener
registered. Unmounted bells accumulate in the subscriber list and fire
setState into dead components.

## Ticket C — "A dismissed toast eats the next one"

When one handler unsubscribes another *during* an emit (a toast that
dismisses a sibling), the sibling that was supposed to receive the same
in-flight event is skipped entirely.

## Fast Reproduction Path

1. Open `/toast-bus`.
2. Click **Show toast** twice → three toasts appear (Ticket A).
3. Toggle the bell off → `handlerCount("alert")` stays at 1 (Ticket B).
4. Register two handlers where the first removes the second, then emit →
   only the first runs (Ticket C).

## Root Cause Hints

- **A:** the hub calls `on("toast", handler)` **directly in the component
  body**, so every render registers another listener and none is ever
  removed. Each incoming toast triggers a re-render, which subscribes
  again — a snowball. Subscriptions belong in a `useEffect` (subscribe on
  mount, unsubscribe on cleanup), not the render body.
- **B:** the bell subscribes in an effect but its cleanup calls
  `off("alert", <a brand-new inline function>)` — a different reference
  from the one it registered, so `off` never finds it. Unsubscribe with
  the *same* handler reference, or use the token `on` returns.
- **C:** `emit` iterates the live handler `Set` while a handler mutates it
  (`off`), so a not-yet-visited subscriber gets removed before its turn
  and is skipped. Iterate over a *snapshot* (`[...set]`) so the in-flight
  delivery is stable.

## Requirements for the Fix

- Publishing twice shows exactly two toasts (Red A).
- Unmounting the bell removes its listener — `handlerCount("alert")` is 0
  (Red B).
- An emit reaches every subscriber registered when it started, even if a
  handler unsubscribes another (Red C).
- A single publish still shows one toast (guard).
- Research topics: subscribing in effects vs render, stable handler
  identity for unsubscribe, snapshotting listeners before dispatch to
  survive reentrant mutation.
