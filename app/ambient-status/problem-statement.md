# Ambient Status Problem Statement

## Context

The status bar reflects two pieces of the user's environment: the OS
color scheme (via `matchMedia`) and a focus clock that counts seconds of
active use. Two tickets from a productivity-scale company. The common
mistake: **treating a live environment as a constant.**

## Ticket A — "The app ignores the OS theme switch"

Switch the OS to dark mode with the app open — nothing happens. The theme
is read exactly once and never again; the OS broadcasting the change has
nobody listening. (Auto dark mode at sunset makes this a nightly
complaint.)

## Ticket B — "The focus clock counts time I wasn't there"

Background the tab for an hour, come back: the focus clock happily added
the whole hour. The interval ticks whether anyone is looking or not —
"active time" is actually "time since mount". Metrics built on it are
garbage.

## Fast Reproduction Path

1. Open `/ambient-status`, flip the OS theme → the label stays "light"
   (Ticket A).
2. Hide the tab for 5 seconds → the counter kept climbing (Ticket B).

## Root Cause Hints

Both environment facts come with a change event the code never uses:

- **A:** `window.matchMedia(query)` returns a live `MediaQueryList` — it
  fires a `"change"` event whenever the answer flips. Reading `.matches`
  once at mount takes a snapshot and throws the live object away.
  Subscribe in an effect (and unsubscribe on cleanup).
- **B:** the Page Visibility API (`document.visibilityState`, the
  `visibilitychange` event on `document`) says exactly when the user
  leaves and returns. The focus clock must stop its interval on
  `hidden` and restart on `visible` — an interval created once at mount
  knows nothing about any of it.

## Requirements for the Fix

- Flipping the OS scheme updates the theme label live (Red A).
- The clock pauses while hidden and resumes on return — 3s visible + 5s
  hidden + 2s visible = 5s (Red B).
- The clock still counts while visible (guard).
- Research topics: `MediaQueryList` change events, the Page Visibility
  API (`visibilitychange`, `visibilityState`), and browser timer
  throttling in background tabs (why visible-time accounting can't just
  count ticks).
