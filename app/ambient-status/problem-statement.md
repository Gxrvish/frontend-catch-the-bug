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

## Ticket C — "Opening the app in a background tab still bills me time"

Middle-click a link to the dashboard and leave it in the background. The
tab has never been looked at, yet the focus clock starts at mount and
counts anyway. The mount-time state of the environment is as much part of
"live" as the events that follow it.

## Ticket D — "Background tabs still burn a wake-up per second"

Battery reports flag the app for keeping a one-second timer alive in
hidden tabs. Whatever pauses the clock has to stop the timer, not just
throw its ticks away — a swallowed increment still costs the wake-up.

## Fast Reproduction Path

1. Open `/ambient-status`, flip the OS theme → the label stays "light"
   (Ticket A).
2. Hide the tab for 5 seconds → the counter kept climbing (Ticket B).
3. Open the page in a background tab → the counter climbs from mount
   (Ticket C).
4. Hide the tab and watch the timer count in DevTools → still one wake-up
   a second (Ticket D).

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

Both subscriptions are also both directions of a pair: whatever you add
has to come back off when the component unmounts, and adding it once per
render is its own leak.

## Requirements for the Fix

- Flipping the OS scheme updates the theme label live (Red A).
- The first paint already shows the scheme the tab opened in, before any
  event fires, and later flips keep working in both directions (Red A2).
- Exactly one `change` handler is registered across re-renders, and none
  survives unmount (Red A3).
- The clock pauses while hidden and resumes on return — 3s visible + 5s
  hidden + 2s visible = 5s (Red B).
- A tab that was hidden before mount counts nothing until it is looked at
  (Red C).
- Hiding the tab retires the timer instead of ignoring its ticks, and
  returning brings it back (Red D).
- Exactly one `visibilitychange` handler is registered, and none survives
  unmount (Red D2).
- The clock still counts while visible (guard).
- Research topics: `MediaQueryList` change events, the Page Visibility
  API (`visibilitychange`, `visibilityState`), and browser timer
  throttling in background tabs (why visible-time accounting can't just
  count ticks).
