# Stock Alerts Problem Statement

## Context

The alerts page holds one live price-feed subscription (`priceFeed.ts` —
the vendor bills **per connection**, so the module counts them), a
watchlist with a filter box, and an alert log fed by ticks. Billing
flagged this page: a single open tab produced hundreds of connections per
hour. Two tickets.

## Ticket A — "Typing in the filter reconnects the feed"

Every keystroke in the watchlist filter tears the subscription down and
reopens it. Connection counter climbs one-per-character. The filter is a
purely client-side display concern — the feed shouldn't notice it at all.

## Ticket B — "Every alert reconnects the feed"

Even with the filter untouched, the connection count climbs whenever an
alert arrives. Arriving tick → reconnect → the fresh connection replays
its script → another tick → another reconnect. The feed chases its own
tail; on quiet days it's fine, on volatile days it melts.

## Fast Reproduction Path

1. Open `/stock-alerts`, wait for the first alert, type 3 characters →
   `getConnectCount()` climbs by 3 (Ticket A).
2. Fresh mount, wait 150ms → count is already 2 (Ticket B).

## Root Cause Hints

The subscription effect in `FeedPanel` is honest — given its inputs. Its
dependency array lists `options` and `onAlert`, and React compares deps
with `Object.is`, reference by reference. Now read the call site in
`StockAlerts`:

- `options={{ symbols: WATCHED_SYMBOLS }}` — an object literal in JSX.
  What does that expression produce on every parent render, even though
  its *contents* never change?
- `onAlert={(tick) => ...}` — same question for the arrow function.

Any parent re-render (a filter keystroke, an alert landing in state)
manufactures fresh identities for both props, and the effect dutifully
reconnects. Two inputs, two separate leaks — stabilizing only one still
leaves the other churning, so fix both and prove each with its own test.
This is the effect-deps sibling of the memo lesson: referential stability
is part of a component's API contract.

## Requirements for the Fix

- Typing in the filter must not reconnect (Red A).
- Exactly one connection while alerts arrive (Red B).
- Tick prices render; the filter still narrows the watchlist (guard).
- Don't fix it by lying to the effect (emptying its dependency array or
  suppressing the lint rule) — make the *inputs* stable instead. Research
  topics: how effect deps are compared, `useMemo`/`useCallback`/hoisting
  for referential stability, "removing effect dependencies" in the React
  docs, why unstable props are an API-design smell for subscription
  components.
