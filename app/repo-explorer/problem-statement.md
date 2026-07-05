# Repo Explorer Wrong Cache Problem Statement

## Context

The explorer shows a developer's public repositories, with tabs to flip
between profiles. Server state is managed with TanStack Query (`useQuery` in
`useUserRepos.ts`); the fake API (`repoApi.ts`) answers in ~300ms.

A support ticket at a code-hosting scale company reads: "I opened my
teammate's profile and it showed **my** repositories under **her** name.
Refreshing fixed it. Legal is asking if private data leaks the same way."

## Problem

Switching profiles updates the header instantly but the repository list stays
frozen on whatever profile loaded first. No spinner, no refetch — the app
confidently shows one user's data under another user's name.

## Failure Scenario

1. Explorer opens on @nova-dev; repos load correctly.
2. User clicks @quantum-cat.
3. Header says "@quantum-cat — Quinn Alvarez"; list still shows `nova-cli`,
   `hyperfetch`, `dotfiles`.
4. No network request is made at all — the wrong answer comes straight from
   the cache, forever.

## Fast Reproduction Path

1. Open `/repo-explorer`, let the first profile load.
2. Click any other profile tab; watch the list not change.
3. Open the network tab (or add a `console.log` to `fetchRepos`) — note that
   switching tabs fires **no** new request.
4. `RepoExplorer.test.tsx` encodes this: after switching to @quantum-cat the
   list must contain `qsim` and must not contain `nova-cli`.

## Root Cause Summary

TanStack Query's cache is a map from **query key** to query state. The key is
the identity of the data; the query function is just how to fill it. If two
different requests share one key, the library correctly treats them as the
same data: the second consumer gets an instant cache hit and no refetch is
scheduled, because from the cache's point of view nothing changed. Look at
what `useUserRepos` puts in its key — and what it leaves out.

## Requirements for the Fix

- Switching profiles must show that profile's repos (encoded in
  `RepoExplorer.test.tsx`), with the previous profile's rows gone.
- The initial load must still work with a loading state (also encoded).
- Do not bypass the cache (no `refetch()` on click, no
  `queryClient.clear()`, no keys with `Math.random()`). The fix is the
  idiomatic one. Research topics: query keys as dependencies, how TanStack
  Query decides to refetch, `staleTime` vs `gcTime`, why every variable a
  `queryFn` reads belongs in the key (the `@tanstack/query` eslint plugin
  exists for exactly this).
