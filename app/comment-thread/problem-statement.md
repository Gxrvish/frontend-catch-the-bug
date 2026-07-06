# Comment Thread Ghost Comment Problem Statement

## Context

The thread posts comments optimistically: the comment appears in the list
immediately, then the API call (~150ms) confirms it. On success, the server
copy replaces the optimistic one. The API's moderation layer rejects
comments containing banned words (deterministically — try the word "spam").

QA ticket from a social-platform scale company: "Post a comment that
moderation rejects. You get the red error banner — correct — but the
comment **stays in the thread**, looking exactly like a delivered comment.
Users screenshot it as proof their comment was posted, then rage when it's
gone after a refresh."

## Problem

The optimistic insert has no rollback. The success path is fine (optimistic
entry gets swapped for the server record), but the failure path only shows
an error banner and leaves the optimistic entry in state forever. UI state
and server state have permanently diverged — the thread renders a comment
the server has never accepted.

## Failure Scenario

1. Type a comment containing "spam", click **Post comment**.
2. Comment appears instantly (optimistic — correct so far).
3. ~150ms later the API rejects it. Error banner appears.
4. The rejected comment is still sitting in the thread, indistinguishable
   from a real one. Refresh: it's gone — it never existed server-side.

## Fast Reproduction Path

1. Open `/comment-thread`, post "totally spam offer".
2. Error banner + ghost comment, every time.
3. `CommentThread.test.tsx` encodes the fix: after the rejection banner
   shows, the rejected text must be gone from the thread.

## Root Cause Summary

This component hand-rolls optimistic UI with `setComments` and a `.catch`
whose author decided a banner was "enough for now". Manual rollback is
possible but subtly hard (which entry do you remove when three posts are in
flight and the second fails?). React 19 ships a hook built precisely for
this: it lets you render a _temporary layer_ on top of real state, and that
layer **evaporates automatically** when the async action finishes — unless
the action committed the change into real state. Rollback stops being code
you write and becomes the default.

## Requirements for the Fix

- A moderation-rejected comment must vanish from the thread once the error
  banner appears — encoded in `CommentThread.test.tsx`.
- A successful post must show the comment exactly once, with no error
  banner (also encoded).
- Use the React 19 primitive rather than hand-rolled removal — the lesson
  is the primitive. Research topics: `useOptimistic` (base state, reducer,
  why updates must happen inside a transition), `useTransition` with async
  functions, how the optimistic layer reconciles when the transition ends,
  multiple in-flight optimistic updates.
