# Infinite Feed Problem Statement

## Context

The activity stream loads forward with an `IntersectionObserver` watching
a sentinel at the bottom of the scroller, and backward with a **Load
previous** button that prepends older entries. `feedApi.ts` is the
gateway; it logs every cursor it is asked for (`getFetchLog()`), which is
how QA measured all of this. Rows are a fixed 40px.

Four tickets from a social-scale company, all about a list that is being
mutated at both ends while the user is reading it.

## Ticket A — "One scroll costs us three page requests"

The sentinel crossing the viewport fires the observer callback several
times in a row — that is normal, and the code has a `loading` guard for
it. The guard is a piece of **state**, so every callback in the burst
reads the value from the render they all started in, sees `false`, and
starts its own request. The fetch log shows the same cursor two or three
times per scroll.

## Ticket B — "The feed shows page 1 forever"

Scroll again after the first page lands and the same page arrives again.
The cursor advanced in state, but the thing that reads it did not — so
the feed never gets past its first page.

## Ticket C — "Loading older entries throws me down the page"

Press **Load previous** and the entry you were reading jumps out of the
viewport. Five 40px rows were inserted _above_ the visible area, so
everything the user was looking at moved 200px down while their scroll
offset stayed where it was. Do it twice and you are 400px adrift.

## Ticket D — "Closed feeds keep observing"

Navigating away leaves the observer connected to a sentinel in a tree
React has already discarded; it keeps firing callbacks into it.

## Fast Reproduction Path

1. Open `/infinite-feed`, let the sentinel intersect → `getFetchLog()`
   shows `"0"` more than once (Ticket A).
2. Let it intersect again → `"0"` again, never `"1"` (Ticket B).
3. Scroll down, press **Load previous** → the reading position jumps
   (Ticket C).
4. Unmount the feed → the observer was never disconnected (Ticket D).

## Root Cause Hints

- **A:** `setLoading(true)` does not change `loading` for the callback
  that is running, nor for the next one in the same burst — state
  updates are visible on the _next_ render. A guard against re-entry
  during a synchronous burst has to be readable and writable _now_.
  Note that swallowing every repeat forever is the opposite bug: the
  latch has to open again when the page lands.
- **B:** the observer is created once, in an effect with `[]` deps, and
  the callback it closes over captured `nextCursor` from the first
  render. Either the value it reads has to live somewhere that isn't
  frozen at mount, or the subscription has to be rebuilt when the cursor
  changes — and rebuilding it on every render is its own leak.
- **C:** the browser preserves `scrollTop`, not the content at that
  offset. Prepending N rows above the viewport moves the content down by
  N × row height, so the scroller has to be nudged by exactly that much
  before the browser paints. (`scrollHeight` is always `0` in jsdom —
  anchor on the known row height, not on a measurement.)
- **D:** an effect that subscribes returns the unsubscribe. This one
  returns nothing.

## Requirements for the Fix

- A burst of intersections fetches one page (Red A), and the latch opens
  again so the next burst still advances (Red A2).
- Consecutive intersections walk the cursor forward — `"0"`, `"1"`,
  `"2"` (Red B).
- A prepend shifts the scroll offset by the height of what was inserted,
  and does so again on the next prepend (Red C, Red C2).
- Unmounting disconnects the observer (Red D).
- The first page still renders in order (guard).
- Research topics: `IntersectionObserver` and sentinel patterns, why a
  state flag cannot guard a synchronous burst (refs vs. state), stale
  closures in `[]`-dep effects, and scroll anchoring on prepend.
