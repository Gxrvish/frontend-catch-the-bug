# Watchlist Store Dead Button & Render Storm Problem Statement

## Context

The watchlist page is backed by a single [zustand](https://github.com/pmndrs/zustand)
store holding the title catalog, the grid filter text, and the My List actions.
Every component reads from the store; render-count badges (`r:N`) are displayed on
each card and panel so rendering behavior is visible.

QA at a streaming-scale company filed two tickets against this page:

1. "**Add to My List does nothing.** But if you press *Refresh Trending*
   afterwards, the title suddenly appears in My List. Remove works instantly."
2. "**Typing in the filter box makes every card's render badge climb** — even the
   My List panel, which doesn't care about the filter, re-renders on every
   keystroke."

## Problem

Two independent defects share one root theme: how React subscribes to an external
store, and what that store is contractually required to do.

## Failure Scenarios

### A. The dead Add button

1. Click **+ Add to My List** on any title.
2. Nothing on screen changes. The state *did* change — but no component was told.
3. Click **Refresh Trending** (a legitimate store update).
4. The earlier add suddenly becomes visible, piggybacking on the unrelated update.

### B. The render storm

1. Watch the `r:N` badges on the title cards and the My List panel.
2. Type a few characters into the filter box.
3. Every badge increments on every keystroke, including components whose output
   did not change at all.

## Fast Reproduction Path

Open `/watchlist` — both bugs reproduce deterministically, no timing needed.
For A: add a title, observe nothing, press Refresh Trending. For B: type in the
filter box and watch the badges.

## Root Cause Summary

- One store action updates state in a way the store cannot see, so subscribers
  are never notified — and it also corrupts the previous state snapshot, breaking
  the immutability contract external stores must uphold for React.
- Components subscribe to the store far more broadly than what they actually
  render, so any state transition — however unrelated — re-renders them.

## Requirements for the Fix

- Adding a title must appear in the UI immediately, and previous state snapshots
  must never be mutated (`watchlistStore.test.ts` encodes both).
- The My List panel must not re-render when only the filter text changes
  (`MyListPanel.test.tsx` encodes this).
- Keep a single zustand store — no context providers, no lifting state.
- Hints worth researching: how zustand v5 uses `useSyncExternalStore`, selector
  granularity, and `useShallow` for derived arrays.
