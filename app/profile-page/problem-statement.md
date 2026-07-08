# Profile Page Triple Fetch Problem Statement

## Context

The account page is assembled from independent widgets: a profile header, a
plan sidebar, and a billing panel. Each widget calls the shared `useUser`
hook to load the signed-in user, so any widget can be dropped onto any page
and still work on its own.

QA ticket from an identity-platform-scale company: "Backend flagged us in
the API gateway dashboard: every single page view of `/profile-page` fires
**three identical** `GET /user/u-1` requests within the same frame. At our
traffic that triples the load on the users service for zero benefit. The
page *looks* fine — the data is just fetched three times."

## Problem

`useUser` performs its own fetch in its own `useEffect`. Three widgets ×
one hook call each = three concurrent requests for the same resource. Every
component pays the full network cost because nothing in the data layer
knows a request for that user is already in flight.

## Failure Scenario

1. Open `/profile-page` with the network tab open.
2. Three identical user requests fire simultaneously.
3. All three resolve with the same payload; the page renders normally —
   the waste is invisible in the UI.

## Fast Reproduction Path

1. The fake API counts calls: `getCallCount()` in `userApi.ts`.
2. `ProfilePage.test.tsx` encodes the fix: after all three widgets render
   the user's data, the call count must be exactly **1**.

## Root Cause Summary

The hook's comment celebrates that "each widget owns its own data fetch" —
component independence is a fine goal, but it was implemented at the wrong
layer. The components can stay independent; the *data layer* underneath
them must not be. When several consumers ask for the same resource at the
same time, the network layer should hand every caller the **same in-flight
promise** instead of starting a new request. This request deduplication is
the core mechanism inside SWR and react-query — this page hand-rolls its
data access and skipped it.

## Requirements for the Fix

- All three widgets must still render the user's name, plan, and card
  digits (guard test) while `fetchUser` is invoked exactly once — encoded
  in `ProfilePage.test.tsx`.
- Keep the widgets independent: each still calls `useUser` itself. Fix the
  data layer they share, don't lift the fetch into the page and thread
  props down. Research topics: request deduplication, sharing in-flight
  promises, stale-while-revalidate, cache invalidation, why data libraries
  key caches by serialized request identity.
