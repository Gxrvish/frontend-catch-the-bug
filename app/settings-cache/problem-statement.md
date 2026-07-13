# Settings Cache Problem Statement

## Context

Viewer settings persist across visits through `localStorage`
(`settingsCache.ts`). Two tickets from a dashboard-scale company — one
about what Storage does to non-strings, one about trusting what comes
back out.

## Ticket A — "Settings never survive a reload"

Save any settings, reload — the load **crashes** with
`SyntaxError: "[object Object]" is not valid JSON`. The stored value is
literally the string `[object Object]`: the settings object went in, its
`toString()` came out.

## Ticket B — "One bad value bricks the page forever"

A user with a corrupted stored value (an old release's format, a
truncated write, an extension scribbling in storage) gets a crash on
**every** load. Nothing short of manually clearing site data fixes it —
the crash happens before the UI can offer anything.

## Fast Reproduction Path

1. Open `/settings-cache`, toggle the layout, click **Reload from
   storage** → SyntaxError (Ticket A).
2. Seed `localStorage["viewer-settings"] = "{layout:grid"` and reload →
   crash again, forever (Ticket B).

## Root Cause Hints

- **A:** `Storage.setItem` stores **strings** — anything else is coerced
  via `String(value)`, and for a plain object that's `"[object Object]"`.
  There is no implicit serialization; `JSON.stringify` on the way in is
  the caller's job.
- **B:** everything read from storage is **untrusted input** — other
  releases, other tabs, extensions, and quota-truncated writes all share
  the same keys. `JSON.parse` on it must be guarded, falling back to
  defaults instead of taking down the page.

## Requirements for the Fix

- Settings round-trip through storage intact (Red A).
- A corrupt stored value loads as defaults without throwing (Red B).
- An empty store still yields defaults (guard).
- Research topics: `Storage.setItem` string coercion, treating storage
  as untrusted input (guarded parse + schema fallback), and
  versioning/migrating persisted client state.
