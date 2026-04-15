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

## Root Cause Summary

The polling merge flow can overwrite an in-flight optimistic read state with a stale server snapshot for the same notification ID.

## Requirements for the Fix

- Keep server data authoritative in steady state.
- Respect in-flight optimistic read updates to prevent flicker.
- Make a minimal, targeted change without redesigning the whole data flow.
