# Hotkey Nav Problem Statement

## Context

The mail folders list has Gmail-style shortcuts: `j`/`k` move the
selection, `⌘K` opens the command palette. One global `keydown` listener
on `document` handles all of it. Two tickets from a mail-scale company —
both about **when a global shortcut must stand down**.

## Ticket A — "I can't type j or k in the search box"

Typing a query containing `j` or `k` scrolls the folder list around
behind the search field. Every keystroke the user types is also fed to
the shortcut map — the listener never asks *where* the key was pressed.

## Ticket B — "⌘K opens the palette and moves the list — and the browser's search bar"

The palette opens, but the selection also jumps (the plain-`k` branch
matches too — `event.key` is still `"k"` when ⌘ is held), and the
browser's own ⌘K behavior fires on top because nothing called
`preventDefault`.

## Fast Reproduction Path

1. Open `/hotkey-nav`, focus the search box, type `jj` → the folder
   selection moves (Ticket A).
2. Press `⌘K` → palette opens, selection also moves, browser default not
   suppressed (Ticket B).

## Root Cause Hints

- **A:** a document-level shortcut listener sees every key on the page,
  including keys the user is typing into an editable control.
  `event.target` says where the key landed — shortcuts must return early
  for inputs, textareas, selects, and `isContentEditable` elements.
- **B:** two problems in the dispatch order: modifier combos must be
  matched **first and exclusively** (a plain-`k` binding must not run
  when a modifier is held), and a combo the app claims must be
  `preventDefault()`ed so the browser's own binding stays quiet.

## Requirements for the Fix

- Keys typed into the search field never drive the list (Red A).
- `⌘K` opens the palette, does not move the selection, and cancels the
  browser default (Red B).
- Plain `j`/`k` on the page still move the selection (guard).
- Research topics: global shortcut hygiene (editable-target guards,
  `isContentEditable`), modifier-key matching order, and
  `preventDefault` for claimed browser shortcuts.
