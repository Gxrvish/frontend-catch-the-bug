# Collab Cursor Problem Statement

## Context

The doc shows every peer's cursor live, backed by a module-singleton
store (`cursorStore.ts`) that a websocket feeds in production. Your own
cursor renders instantly on move but its network broadcast is debounced.
Two tickets from a realtime-collab-scale company.

## Ticket A — "A peer who was already moving shows up in the wrong place"

When you open a doc, peers who moved _just before_ you connected render at
their **old** positions and never correct — until they happen to move
again. The relay clearly delivered the update (the store's data is
right), but this client is showing a stale snapshot it captured at mount.

## Ticket B — "We're flooding the relay"

Dragging your cursor is supposed to debounce into a single broadcast per
rest. Instead every intermediate position hits the wire — a 4-hop drag
sends 4 broadcasts, not 1. Bandwidth graphs spike with active editors.

## Fast Reproduction Path

1. Open `/collab-cursor`: peer "Mira" (who moved during your connect)
   renders at her old spot (Ticket A).
2. Click the four Move buttons quickly, wait → the store logged 4
   broadcasts, not 1 (`getMoveCount()` delta; Ticket B).

## Root Cause Hints

- **A:** the store is read with `useState(getSnapshot())` seeded at
  mount, then subscribed in a **passive** `useEffect`. Between the render
  that seeds the state and the effect that subscribes, the relay
  delivered a move — and because the subscription wasn't live yet, this
  client never heard it, and the seed is frozen. This is the exact gap
  `useSyncExternalStore` exists to close: it subscribes in the commit
  phase and re-reads the snapshot, so an update in the render→subscribe
  window can't slip through. External _mutable_ stores must be read
  through it, not hand-rolled `useState`+`useEffect`.
- **B:** the debounce wraps `moveCursor`, but it's constructed **inline
  in the component body** — so every render builds a _new_ debounce with
  its own fresh timer. Your optimistic local move re-renders the
  component between hops, each render makes a new debouncer, and each
  one's timer fires independently: no call ever cancels another. A
  debounce (or throttle) only works if a **single instance** persists
  across renders — its timer state is the whole point.

## Requirements for the Fix

- A peer move delivered during mount is reflected (Red A).
- Catching up at mount must not cost the live subscription — a peer move
  after mount still renders (Red A2).
- A 4-hop burst collapses to exactly one broadcast (Red B).
- The one broadcast carries the **last** position of the burst; a
  leading-edge debounce also sends one, and sends the wrong one (Red B2).
- Every burst collapses, not only the first — broadcasting once and then
  going quiet is not debouncing (Red B3).
- A peer move arriving mid-burst still renders, and the re-render it
  causes must not spawn a second timer (Red B4).
- Peers render with names/positions; a settled broadcast updates your
  stored position (guard).
- Read the store through `useSyncExternalStore`; persist one debounce
  instance (`useRef`/`useMemo([])`). Don't paper over B by removing the
  optimistic local render. Research topics: `useSyncExternalStore` and
  the tearing/lost-update problems it solves, why external stores can't
  use plain `useState`+`useEffect`, stable identity of stateful closures
  (debounce/throttle) across renders.
