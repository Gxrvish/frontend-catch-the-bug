# Flash Deals Hydration Mismatch Problem Statement

## Context

The deals bar shows a millisecond-precision countdown and can be dismissed;
dismissal is remembered per device in `localStorage`. The page is
server-rendered first (Next.js prerenders client components), then hydrated
in the browser.

From an everything-store scale company's frontend guild channel: "Every page
with the deals bar logs hydration errors in dev. Lighthouse flags the bar
re-painting on load. Worst: users who dismissed the bar see it flash back
for a frame on every navigation — and twice it came back dismissed-state
lost after React threw the server HTML away."

## Problem

The component's first client render does not match the HTML the server
produced. React detects the mismatch during hydration, logs an error,
discards the server-rendered DOM, and re-renders the tree from scratch on
the client — visible flicker, wasted server work, and any browser-only state
(focus, selection) lost.

Two independent inputs disagree between server and client:
countdown text derived from the wall clock, and the dismissed flag read from
device-local storage that the server can never see. The `typeof window`
guard makes the code *run* on the server — it does not make the two sides
*agree*.

## Failure Scenario

1. Server renders the bar: countdown says `03:59:59.874`, bar visible
   (server has no localStorage).
2. Browser hydrates milliseconds later: countdown computes `03:59:59.612`,
   and on this device `flash-deals-dismissed` is `"1"` so the client renders
   the "dismissed" message where the server rendered a whole deals bar.
3. React 19: "Hydration failed because the server rendered HTML didn't
   match the client." Tree is client-re-rendered; the bar flashes.

## Fast Reproduction Path

1. `npm run dev`, open `/flash-deals`, open the console, reload — hydration
   error every time (the millisecond digits can't match).
2. Dismiss the bar, reload — watch it flash for a frame before disappearing,
   with the structural mismatch logged.
3. `FlashDeals.test.tsx` encodes the fix: `renderToString` output must
   hydrate with zero recoverable errors and zero hydration warnings, even
   when localStorage says dismissed.

## Root Cause Summary

Hydration is a contract: the first client render must produce exactly what
the server produced. Anything read during render that differs between the
two environments — `Date.now()`, `Math.random()`, locale, and *anything*
behind a `typeof window` guard — breaks the contract by construction. The
established cure is a deliberate two-pass render: the first client render
pretends to know only what the server knew, then a post-mount step (an
effect, or a subscription with distinct server/client snapshots) reveals the
client-only truth.

## Requirements for the Fix

- Hydration must be clean: no recoverable errors, no "hydrat…" console
  output, server HTML adopted as-is (encoded in `FlashDeals.test.tsx`).
- After mount the live countdown must appear, and dismissal must still hide
  the bar and persist (also encoded).
- `suppressHydrationWarning` on the countdown is a legitimate, documented
  escape hatch for the *text* part — but it cannot fix the structural
  dismissed/visible mismatch, so understand both halves before reaching for
  it. Research topics: React hydration and two-pass rendering, the
  `useSyncExternalStore` `getServerSnapshot` argument, why
  `typeof window` checks in render are a hydration anti-pattern
  (react.dev: "Handling different client and server content").
