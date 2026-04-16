# Notification Center Read-Status Flicker Problem Statement

## Context

The notification center polls a simulated API every 3 seconds for new or updated notifications.
Users can:

- mark a single notification as read,
- mark all notifications as read,
- dismiss notifications.

All mutations currently use optimistic local updates before server confirmation.

## Problem

Under intermittent timing conditions, a notification that the user has just marked as read briefly flips back to unread, then later returns to read.

This creates visible UI flicker and inconsistent user feedback.

## Failure Scenario

1. User marks notification `n` as read.
2. Local state is updated optimistically (`isRead: true`).
3. Before `markAsReadApi` persists on the server, the poll request returns an older copy of `n` (`isRead: false`).
4. The merge step replaces the existing local item by ID with the incoming server item.
5. UI temporarily shows `n` as unread.
6. A later server update eventually returns `isRead: true`, so the notification flips again.

## Fast Reproduction Path

Use the in-app **Easy Repro Mode** toggle on the notification page:

1. Open `/notification`.
2. Keep **Easy Repro Mode** selected (default on load).
3. Open the bell panel and click **mark as read** on an unread notification.
4. Wait around one poll tick (~2.5s): it can flip back to unread.
5. Wait another poll tick: it flips to read again after the delayed server write.

Use **Reset Scenario** to quickly rerun the same race without waiting for random timing.

## Root Cause Summary

The polling merge flow can overwrite an in-flight optimistic read state with a stale server snapshot for the same notification ID.

## Requirements for the Fix

- Keep server data authoritative in steady state.
- Respect in-flight optimistic read updates to prevent flicker.
- Make a minimal, targeted change without redesigning the whole data flow.
