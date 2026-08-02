# Copy Invite Problem Statement

## Context

The invite pill shows a **shortened** invite link and a copy button
backed by the async Clipboard API (`navigator.clipboard.writeText`). Two
tickets from a collaboration-scale company.

## Ticket A — "It says Copied! even when nothing was copied"

The button flips to "Copied!" the instant it's clicked — before the
clipboard write has finished, and even on machines where the write is
denied or slow. Users paste, get their old clipboard contents, and blame
the product.

## Ticket B — "The pasted link is cut off"

What lands on the clipboard is
`https://app.example.com/invite/9f2c…` — ellipsis included. That's the
_display_ string from the pill, not the invite link. Every pasted invite
404s.

## Fast Reproduction Path

1. Open `/copy-invite`, click **Copy link** → "Copied!" appears
   immediately, while the write is still pending (Ticket A).
2. Paste anywhere → the truncated pill text, ending in `…` (Ticket B).

## Root Cause Hints

- **A:** `writeText` returns a **promise** — the copy has not happened
  when the call returns. Setting "copied" synchronously reports success
  that hasn't occurred (and a rejection is silently dropped: no
  `await`, no `catch`). Await the write; show an in-progress state;
  handle failure.
- **B:** the handler reads `linkRef.current.textContent` — the shortened
  string rendered for the UI. The clipboard should receive the **data**
  (the full link constant), never a re-read of what the DOM happens to
  display.

## Requirements for the Fix

- "Copied!" appears only after the write resolves; while in flight the
  UI says "Copying…", and a rejection shows "Copy failed" (Red A, Red A2).
- The button label and the readout show the same status (Red A3).
- A second click starts the cycle over — the first click's success must
  not still be on screen while the second write is in flight (Red A4).
- The clipboard receives the full invite link (Red B).
- The pill keeps showing the shortened link. Widening it so the scraped
  text happens to be correct is not the repair (Red B2).
- One click still performs exactly one write (guard).
- Research topics: the async Clipboard API (`writeText`'s promise,
  rejection on permission denial), optimistic UI vs confirmed state, and
  copying source data vs scraping the rendered DOM.
