# Keyboard Menu Problem Statement

## Context

The document toolbar has an **Actions** button that opens a four-item menu
(Rename / Duplicate / Export / Delete). It works fine with a mouse. An
accessibility audit at a docs-scale company filed three tickets — all of
them about the one thing a menu owes a keyboard user: **it must own the
focus while it is open, and give it back when it closes.**

## Ticket A — "Tab walks straight out of the open menu"

With the menu open, pressing Tab (or Shift+Tab) leaves the menu and lands
somewhere behind it — while the menu is still on screen, still visually
"the thing you are using". Focus and the UI disagree about where the user
is.

## Ticket B — "Escape drops me at the top of the page"

Press Escape and the menu closes, but focus is on nothing (`<body>`).
The next Tab starts the whole page over from the beginning; the user has
to walk all the way back to the toolbar they were just in.

## Ticket C — "Arrow keys only move the highlight"

ArrowDown moves the blue highlight down the list, but focus stays on the
first item — a screen reader keeps announcing "Rename" no matter where the
highlight is. Tab also stops on **every** item in the menu, so a menu is
four tab stops instead of one.

## Fast Reproduction Path

1. Open `/keyboard-menu`, click **Actions** (focus lands on Rename).
2. Press Shift+Tab → focus leaves the menu entirely (Ticket A).
3. Press Escape → `document.activeElement` is `<body>`, not the trigger
   (Ticket B).
4. Press ArrowDown → the highlight moves, `document.activeElement` does
   not; every item still reports `tabIndex` 0 (Ticket C).

## Root Cause Hints

- **A:** nothing in the component handles Tab — it is "left to the
  browser", which has no idea the menu is modal. An open menu has to
  intercept Tab, `preventDefault()` it, and move focus itself, wrapping
  from the last item to the first (and back).
- **B:** the component knows which element opened the menu (it holds a ref
  to the trigger) but never uses it on the way out. Closing has to send
  focus back where it came from.
- **C:** the menu keeps its "active item" in React state and only paints
  it. Two things are missing: DOM focus must follow the active item, and
  the menu should be **one** tab stop — the pattern is *roving tabindex*:
  the active item is `0`, every other item is `-1`.

## Requirements for the Fix

- Tab and Shift+Tab wrap inside the open menu (Red A).
- Closing with Escape returns focus to the trigger (Red B).
- ArrowDown moves DOM focus, and only the active item is tabbable —
  `[0, -1, -1, -1]` (Red C).
- Clicking an item still runs its action exactly once and closes the menu
  (guard).
- Research topics: focus trapping, focus restoration on dismiss, roving
  tabindex, and the WAI-ARIA Authoring Practices `menu` keyboard contract.
