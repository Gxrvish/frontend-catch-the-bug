# Product Grid State Shuffle Problem Statement

## Context

The product grid lets users pick a quantity and add items to the cart directly
from each card. Each card owns its UI state locally (quantity, "Added ✓" flag).
The grid can be re-sorted (price, rating) and filtered by category.

QA at an everything-store-scale company filed this ticket: "Customer set
quantity 5 on a $129 keyboard, sorted by price, and the 5 jumped onto a $24 desk
lamp. Customers are adding the wrong products in the wrong quantities to carts."

## Problem

Card-local state does not follow the product it belongs to. After any re-sort or
filter change, quantities and "Added ✓" badges appear on **different products** —
whatever product happens to land at the same grid position.

## Failure Scenario

1. Grid is in default "Featured" order; Mechanical Keyboard is the first card.
2. User sets quantity to 5 and clicks **Add to Cart** on the keyboard.
3. User switches sorting to "Price: Low to High".
4. The keyboard moves to the middle of the grid — but the quantity 5 and the
   "Added ✓" badge stay on the **first grid slot**, now occupied by the Desk Lamp.

## Fast Reproduction Path

1. Open `/product-grid` (no timing involved — fully deterministic).
2. Set quantity 5 on "Mechanical Keyboard", click **Add to Cart**.
3. Change sort to "Price: Low to High" and look at which card now shows
   quantity 5 and "Added ✓".
4. Also try the category chips — toggling filters detaches state the same way.

## Root Cause Summary

React reconciles list children by their identity within the list. The grid gives
React an identity signal that describes a card's *position*, not the *product* it
renders — so when the order changes, React matches old state to new props by
position and happily hands one product's state to another.

## Requirements for the Fix

- Quantity and "Added ✓" must stay attached to their product across any
  re-sort or filter change (`ProductGrid.test.tsx` encodes this).
- Do not lift the per-card state into the parent or a store — the fix is a
  one-line change. Understand *why* it works: read up on how React keys drive
  reconciliation and when component state is preserved vs. destroyed.
