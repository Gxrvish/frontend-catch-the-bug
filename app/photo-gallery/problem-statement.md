# Photo Gallery Problem Statement

## Context

The album grid shows clickable photo cards — clicking a card opens the
lightbox. Each card has a trash button that opens a confirm-delete dialog,
rendered through `createPortal` into `document.body` so it floats above
everything. The dialog also dismisses when you click anywhere outside it
(a native `document` click listener). Two QA tickets from a photo-sharing
scale company.

## Ticket A — "Cancel opens the photo"

Click the trash icon, then click **Cancel** in the dialog — the dialog
closes *and the lightbox opens*, as if you'd clicked the card itself. Same
with **Delete**: the photo is removed and then its lightbox opens over the
gap. Users think Cancel is broken.

## Ticket B — "The dialog dismisses itself"

Clicking anywhere *inside* the dialog that isn't a button — the title, the
warning text, the padding — instantly closes it. The outside-click
dismissal treats the dialog's own body as "outside".

## Fast Reproduction Path

1. Open `/photo-gallery`, click a trash icon, click Cancel → lightbox
   opens (Ticket A).
2. Open the dialog again, click the "Delete this photo?" text → dialog
   vanishes (Ticket B).
3. `PhotoGallery.test.tsx` encodes both.

## Root Cause Hints

Both tickets are the same misconception applied to two different event
systems — read the two in-fiction comments in the card, they state it
outright: "the dialog renders into document.body, so its clicks never
touch the card."

- **Ticket A (synthetic events):** React does not propagate events along
  the DOM. It propagates them along the **React component tree**. A portal
  moves where the DOM nodes *land*, but the dialog is still a React child
  of the card — so a click inside the portal bubbles, in React's world,
  straight into the card's `onClick`. The developer already knew the
  stopPropagation trick (see the trash button); they assumed the portal
  made it unnecessary.
- **Ticket B (native events):** the outside-click handler is a *native*
  `document` listener, and it decides inside/outside with
  `containerRef.current.contains(event.target)` — a **DOM** containment
  check against the *card*. In the DOM, the portal's nodes really are
  outside the card. So the check is asking the wrong tree the wrong
  question: DOM containment against the card, for content whose DOM home
  is the body but whose logical home is the dialog.

Note the symmetry: Ticket A happens because the portal does NOT detach the
dialog from the card in the React tree; Ticket B because it DOES detach it
in the DOM tree.

## Requirements for the Fix

- Dismissing (or confirming) the dialog must not trigger the card's click
  — no lightbox (Ticket A test).
- Clicks inside the dialog must not dismiss it (Ticket B test).
- Card click still opens the lightbox; the dialog's Delete still removes
  the photo (guard test).
- Keep the dialog in a portal and keep outside-click dismissal working.
  Research topics: React event delegation (where listeners actually
  attach since React 17), how synthetic events traverse portals, native vs
  synthetic listener ordering, `Node.contains` and writing correct
  outside-click hooks for portaled content.
