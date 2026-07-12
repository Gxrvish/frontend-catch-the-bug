# Cross-Tab Cart Problem Statement

## Context

The cart quantity is kept in sync across browser tabs with a
`BroadcastChannel`. Each tab posts changes and applies changes from other
tabs. Tests run against a fake `BroadcastChannel` (siblings receive a
`postMessage`; the sender does not). Three tickets.

## Ticket A — "My own clicks don't register"

Increment in a tab and *that tab's* number doesn't move — only the other
tabs update. The acting tab sits at its old value until something else
nudges it.

## Ticket B — "The tabs melt down"

When two tabs are open, a single increment ping-pongs between them
forever — each tab re-broadcasts every message it receives, so the
channel storms and counts inflate.

## Ticket C — "Closed tabs keep syncing"

Tabs that have been closed (unmounted) still hold an open channel and
still react to messages, leaking channels and firing state updates into
gone components.

## Fast Reproduction Path

1. Open `/cross-tab-cart`.
2. Click Increment → the tab's own count stays at 0 (Ticket A).
3. Deliver a message to a tab → it immediately posts it right back
   (Ticket B).
4. Unmount a tab → its channel was never closed (Ticket C).

## Root Cause Hints

- **A:** `increment` only calls `postMessage(...)` and waits for the
  channel to "echo it back" — but a `BroadcastChannel` **does not deliver
  a message to the sender**. Update local state directly *and* post for
  the other tabs.
- **B:** `onmessage` applies the incoming quantity and then
  `postMessage`s it again — re-broadcasting a received update. That
  creates an infinite echo between tabs. Apply received updates *without*
  re-broadcasting them.
- **C:** the effect opens a `BroadcastChannel` but its cleanup is empty —
  it never `close()`s the channel on unmount. Close the channel in the
  effect's cleanup.

## Requirements for the Fix

- A local increment updates the acting tab (Red A).
- Receiving a message does not re-broadcast it (Red B).
- Unmounting closes the channel (Red C).
- An incoming quantity still updates the tab (guard).
- Research topics: `BroadcastChannel` semantics (sender doesn't receive
  its own posts), avoiding echo loops in cross-tab sync, closing channels
  and removing listeners on unmount.
