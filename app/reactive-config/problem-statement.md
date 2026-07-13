# Reactive Config Problem Statement

## Context

The workspace config is wrapped by `createReactive` (`reactive.ts`) — a
`Proxy` whose job is to notify the autosave layer and the "unsaved
changes" badge on **every** mutation. This is the same trick Vue and
MobX build on. Two tickets from a settings-scale company, both about
which operations a Proxy actually intercepts.

## Ticket A — "Theme changes never autosave"

Change `config.theme.color` and nothing happens — no badge, no autosave.
Top-level fields (`config.autosave = false`) notify fine. Anything one
level deep is invisible.

## Ticket B — "Removing the promo code doesn't register"

`delete config.promoCode` removes the key — the UI shows "(none)" — but
the change listener never fires, so the deletion is never saved. Reload
and the promo code is back.

## Fast Reproduction Path

1. Open `/reactive-config`, click **Set theme color** → "Unsaved changes"
   stays `none` (Ticket A).
2. Click **Remove promo code** → promo shows "(none)" but "Unsaved
   changes" still doesn't mention it (Ticket B).

## Root Cause Hints

A Proxy only sees what its **handler has a trap for**, and only on the
object it directly wraps:

- **A:** `config.theme.color = "indigo"` performs a **get** of `theme`
  (returning the raw, unwrapped nested object) and then a **set on that
  raw object** — the proxy is not on that call path at all. Reactive
  systems wrap nested objects on the way out of the `get` trap, so every
  level of the tree is proxied.
- **B:** `delete obj.key` is not a `[[Set]]` — it's a different internal
  operation with its own trap name. Without that trap the delete still
  succeeds (default behavior), it just goes unobserved. Add the trap,
  forward with `Reflect`, notify.

## Requirements for the Fix

- Writing a nested field (`theme.color`) fires the change listener and
  the write lands (Red A).
- Deleting a key fires the change listener with the key name (Red B).
- A top-level write still notifies exactly once (guard).
- Research topics: Proxy trap coverage (`get`/`set`/`deleteProperty`),
  `Reflect` as the forwarding layer, and how Vue's `reactive()` handles
  nested objects (lazy wrapping in the `get` trap).
