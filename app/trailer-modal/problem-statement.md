# Trailer Preview Modal Escape-Proof Problem Statement

## Context

Clicking a video card opens a preview modal rendered through `createPortal`
into `document.body` — standard practice so the modal escapes any
`overflow: hidden` / `z-index` stacking contexts in the grid. The card's own
`onClick` opens the preview and reports a card-click analytics event (visible
as the "card clicks" counter in the header).

QA at a video-scale company filed these tickets:

1. "**The preview modal cannot be closed.** The ✕ button flashes but the modal
   stays. Clicking the dark backdrop — same. The only way out is reloading."
2. "**Card-click analytics are inflated.** Every interaction inside the
   preview (mute, add to queue) registers as another card click. The metrics
   team says trailer CTR doubled overnight; it didn't."

## Failure Scenarios

### A. The unclosable modal

1. Click any card — the preview opens.
2. Click ✕ (or the backdrop).
3. The close *does* run — and then the modal is immediately reopened before
   the frame is painted. To the user, the button is simply dead.

### B. Inflated analytics

1. Click a card. "card clicks" reads 1.
2. Inside the preview, click **+ Add to Queue**.
3. The queue count goes up (correct) — and "card clicks" goes to 2 (wrong:
   the user never clicked the card again).

## Fast Reproduction Path

Open `/trailer-modal` — fully deterministic. Click any card, then try to close
the preview. Watch the analytics counter as you click things inside the modal.

## Root Cause Summary

The modal's DOM lives under `document.body`, so by DOM rules its clicks should
never reach the card. But React does not propagate events along the DOM tree —
it propagates them along the **component tree**, and portals are transparent
to that propagation. Where the modal is *rendered from* determines who its
events bubble to.

## Requirements for the Fix

- ✕ and backdrop click must close the preview (`TrailerGrid.test.tsx` encodes
  the ✕ case).
- Clicks inside the preview must never fire the card's `onClick` — queue adds
  must not inflate card-click analytics (also encoded).
- Keep using a portal — the modal must still render into `document.body`.
- Two legitimate fix shapes exist: stop the propagation at the right boundary,
  or restructure so the modal is no longer a child of a clickable component.
  Understand both; know why `stopPropagation` on the *native* document level
  wouldn't have helped. Topics worth researching: React's event delegation
  (root-level listener), how synthetic events traverse portals, and
  `e.stopPropagation()` semantics in React vs the DOM.
