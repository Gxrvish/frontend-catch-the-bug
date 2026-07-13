# Slide Sorter Problem Statement

## Context

The deck editor reorders slide thumbnails with native HTML5 drag & drop —
`draggable` cards, `dragstart`/`dragover`/`drop` handlers, payload carried
on `dataTransfer`. Three tickets from a slides-scale company. All three
live in the drag-and-drop *protocol*, not in React.

## Ticket A — "You can't drop anything, anywhere"

In a real browser the drag starts fine, the hover highlight tracks the
cursor — and releasing the mouse does nothing. The drop handler never
runs. (The author's unit test passed, because the test fired the events
directly. A real browser refuses the drop before the handler is ever
consulted.)

## Ticket B — "Even when the drop fires, nothing moves"

Force the drop through and the deck still doesn't reorder. The drop
handler runs, reads its payload — and gets an empty string, so it bails.
The id that `dragstart` stored is apparently gone.

## Ticket C — "Cancelled drags leave a ghost"

Start dragging a slide, press Escape (or drop outside the deck): the
half-transparent "being dragged" look stays on the card forever. Only a
successful drop cleans it up.

## Fast Reproduction Path

1. Open `/slide-sorter`, drag Opening over Demo, release → no reorder in a
   real browser; in the test, `fireEvent.dragOver(...)` reports the event
   was never cancelled (Ticket A).
2. Fire the drop directly → the order is unchanged (Ticket B).
3. Drag a card, press Escape → the card keeps `data-dragging="true"`
   (Ticket C).

## Root Cause Hints

- **A:** by spec, an element only becomes a valid drop target if its
  `dragover` event is **cancelled** — `event.preventDefault()` is the
  handshake that says "I accept drops". This handler only updates the
  hover highlight; the default (`refuse the drop`) stands, so the browser
  never fires `drop`.
- **B:** `dataTransfer` is a keyed store: data goes in under the format
  string given to `setData` and comes out only under the **same** format
  string. Compare what `dragstart` writes with what `drop` reads.
- **C:** `drop` only fires on success — but `dragend` fires on the dragged
  element after *every* drag, dropped or cancelled. The ghost-clearing
  belongs in a `dragend` handler.

## Requirements for the Fix

- `dragover` on a card is cancelled, making it a legal drop target
  (Red A).
- Dropping slide 1 on slide 3 reorders the deck — the dragged slide takes
  the target's position (Red B).
- A cancelled drag (dragend without drop) clears the dragging state
  (Red C).
- All four slides still render in order (guard).
- Research topics: the HTML drag-and-drop model (`dragover` +
  `preventDefault` as the drop handshake), `DataTransfer.setData`/`getData`
  format keys, and `dragend` vs `drop` lifecycle.
