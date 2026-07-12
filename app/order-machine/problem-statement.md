# Order Machine Problem Statement

## Context

Checkout is a small state machine (`orderReducer.ts`) driven by
`useReducer`. An order walks `cart → review → paying → done`; the reducer
is meant to be the one gate every transition passes through. Three
tickets from a payments team.

## Ticket A — "The subtotal lies after you add something"

Add an item to the cart and the new line shows up in the list, but the
**subtotal doesn't move** — it keeps showing the pre-add total. The item
is clearly in state (you can see the row), yet the memoized subtotal
never recomputes.

## Ticket B — "Customers are getting charged straight from the cart"

The flow is supposed to require a Review step before Pay. But hitting Pay
from the `cart` state charges the card and jumps to `done` — skipping
validation entirely. We've seen orders complete that never passed review.

## Ticket C — "Replaying the same action gives different orders"

Our order log replays reducer actions to rebuild state for audits, and
the rebuilds don't match the originals: the same `pay` action produces a
**different `orderId`** every time it runs. A reducer that isn't
reproducible breaks replay, time-travel debugging, and StrictMode.

## Fast Reproduction Path

1. Open `/order-machine`.
2. Click **Add item** → a $5 row appears but the subtotal stays $10
   (Ticket A).
3. Reload, click **Pay** without Review → status jumps to `done` and an
   order id is minted (Ticket B).
4. Feed the same `{ type: "pay" }` action to the reducer twice → two
   different `orderId`s (Ticket C).

## Root Cause Hints

- **A:** `addItem` does `state.items.push(item)` and returns
  `{ ...state }`. The spread makes a new top-level object, but `items` is
  the *same array reference* — so `useMemo(..., [order.items])` sees an
  unchanged dependency and returns the stale subtotal. The list rendered
  fine only because it reads the mutated array directly. Nested updates
  must be immutable too: build a new array (`[...state.items, item]`),
  don't mutate the old one.
- **B:** the `pay` case runs no matter what `state.status` is — there's
  no guard on the current state, so an illegal `cart → done` jump is
  allowed. A state machine's reducer must reject transitions that don't
  originate from a legal source state.
- **C:** the reducer mints `orderId` with `Math.random()` inside the
  `pay` case, so it isn't a pure function of `(state, action)` — the same
  inputs yield different outputs. Non-determinism inside a reducer breaks
  action replay and is exactly what React's StrictMode double-invoke is
  designed to surface. The id must come *in* (via the action payload) or
  be derived deterministically from state.

## Requirements for the Fix

- Adding an item updates the subtotal (Red A).
- Paying from `cart` is rejected; the status stays `cart` (Red B).
- The reducer is pure — same `(state, action)` ⇒ same result (Red C).
- A legal `cart → review → pay` flow reaches `done` with an order id
  (guard).
- Keep the reducer a pure function; do transitions immutably; guard
  transitions by the current status. Research topics: reducer purity and
  action replay, immutable nested updates, modeling flows as finite state
  machines with guarded transitions.
