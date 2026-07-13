# Catalog Filters Problem Statement

## Context

The catalog page keeps its filters in the URL — pick a brand and the page
pushes `?brand=…` so the view is shareable and the Back button should undo
filter changes, like every store-scale product does it. Three tickets from
a commerce-scale company, all about the session-history contract.

## Ticket A — "Back changes the URL but not the page"

Pick Nike, then Adidas, then press Back: the address bar says
`?brand=Nike` but the page still shows Adidas. The app writes history
entries it never reads back — navigation is a one-way street.

## Ticket B — "Back walks through every letter I typed"

Type "runner" into the search box, then hold Back: the browser steps
through `?q=runne`, `?q=runn`, `?q=run`… six entries for one word. Bounce
rate on this page tripled — users can't leave it.

## Ticket C — "The Fog & Mist link is broken"

Share the URL after picking **Fog & Mist** and the receiver sees the brand
as "Fog " — everything after the `&` is parsed as another query parameter.
Every brand (or search term) containing `&`, `=`, `#` or `+` corrupts the
URL.

## Fast Reproduction Path

1. Open `/catalog-filters`, click Nike then Adidas, press Back → UI stuck
   on Adidas (Ticket A).
2. Type six characters in the search box → six new history entries
   (Ticket B).
3. Click **Fog & Mist** → `new URLSearchParams(location.search).get("brand")`
   returns `"Fog "` (Ticket C).

## Root Cause Hints

- **A:** `pushState` never notifies the app — the browser only fires a
  `popstate` event when the user *travels* (Back/Forward). Nothing in the
  component listens for it. Subscribe in an effect (and unsubscribe on
  cleanup), then restore the UI from `event.state` / `location.search`.
- **B:** the search box calls `pushState` on every keystroke. History
  entries are for *places the user can go back to*, not for transient
  state. The History API has a second method that updates the current
  entry in place — transient state belongs there.
- **C:** the URL is glued together with a template string, so the brand's
  own `&` becomes query-string syntax. Query values must be percent-encoded
  — `URLSearchParams` (or `encodeURIComponent`) does this for free.

## Requirements for the Fix

- Back restores the previously selected brand in the UI (Red A).
- Typing a six-letter search grows history by at most one entry (Red B).
- "Fog & Mist" round-trips through the URL intact (Red C).
- Clicking a simple brand still updates the URL and filters the list
  (guard).
- Research topics: the History API (`pushState` vs `replaceState`, the
  `popstate` event and `event.state`), `URLSearchParams`, and
  percent-encoding of query values.
