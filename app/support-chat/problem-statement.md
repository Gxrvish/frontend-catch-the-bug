# Support Chat Scroll & Unseen Pill Problem Statement

## Context

The support chat pane receives agent messages over a simulated websocket
(connected once on mount) and lets the user send messages. Expected behavior,
standard for any chat product:

- Sending a message scrolls the pane fully to that new message.
- If the user has scrolled up to read history, incoming messages must NOT yank
  them to the bottom — a "N new messages" pill appears instead.

QA at a messaging-scale company filed two tickets:

1. "Sending a message scrolls the pane, but it lands **one message short** —
   your own message sits just below the fold until you nudge the scrollbar."
2. "While reading older messages, every incoming agent reply **force-scrolls me
   to the bottom**. The new-messages pill has never been seen in the wild."

## Failure Scenarios

### A. Scroll lands short on send

1. Type a message and hit **Send**.
2. The pane scrolls — but to the bottom of the *previous* content height.
3. The just-sent message is below the fold.

### B. Reader gets yanked, pill never shows

1. Scroll up in the message history.
2. Click **Trigger agent reply** (or wait for the periodic reply).
3. The pane jumps to the bottom even though you were reading, and the
   "1 new message" pill never appears.

## Fast Reproduction Path

Open `/support-chat`:

- For A: send any message and look at where the scrollbar rests.
- For B: scroll to the top, press **Trigger agent reply**, and watch yourself
  get yanked down. Note the pill count stays at zero forever.

## Root Cause Summary

Two distinct React timing mistakes:

- The send handler updates state and then immediately measures the DOM to
  scroll — but React batches state updates, so at that moment the DOM has not
  been updated yet. The measurement is taken against the old content.
- The socket callback is created once, inside a subscription effect that runs a
  single time. Every value it closes over is frozen at first-render time —
  including whether the user is at the bottom.

## Requirements for the Fix

- After sending, the pane must rest exactly at the bottom of the *new* content
  (`ChatPane.test.tsx` encodes this).
- Incoming messages must respect the user's live scroll position: no yank when
  scrolled up, and the unseen counter must increment (also encoded in the test).
- Keep a single socket connection for the lifetime of the pane — reconnecting
  per render or per scroll is not acceptable.
- Topics worth researching: automatic batching, `useEffect` vs `useLayoutEffect`
  vs `flushSync`, and the stale-closure problem in long-lived subscriptions
  (refs as an escape hatch).
