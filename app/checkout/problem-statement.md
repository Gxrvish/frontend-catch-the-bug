# Checkout Stale Total & Render Storm Problem Statement

## Context

The checkout page shares cart state through a single React context
(`CartContext`): items, coupon, shipping method, and a gift note. The Order
Summary (`PriceBreakdown`) is wrapped in `memo()` and caches its price math
with `useMemo`, because at real cart sizes the breakdown is expensive to
compute. A render badge on the summary makes its render count visible.

QA at a payments-scale company filed two tickets:

1. "**Coupon applies but the total doesn't move.** The green 'Coupon SAVE10
   applied' text shows up, the discount row stays at −$0.00. If the customer
   then switches shipping method, the discount suddenly appears. Customers
   think the coupon is broken and abandon checkout."
2. "**The Order Summary re-renders on every keystroke of the gift note.**
   The `memo()` wrapper appears to do nothing."

## Failure Scenarios

### A. Stale total after coupon

1. Cart: $100 keyboard + 2 × $50 mouse = $200 subtotal, $5 shipping → $205.00.
2. Enter `SAVE10`, click **Apply**. "Coupon SAVE10 applied." appears.
3. Total still reads **$205.00** (should be $185.00).
4. Click **Express $15** shipping — now the discount appears out of nowhere.

### B. Gift note render storm

1. Watch the `renders: N` badge on the Order Summary.
2. Type into the gift note field.
3. The badge increments on every keystroke, despite `memo()` and despite the
   gift note having zero effect on pricing.

## Fast Reproduction Path

Open `/checkout` — deterministic, no timing. Follow the scenarios above.

## Root Cause Summary

- The memoized price computation declares an incomplete picture of what it
  depends on, so React serves a cached result computed before the coupon
  existed.
- Every provider render manufactures a brand-new context value object, and the
  context bundles unrelated concerns together — `memo()` protects against
  parent re-renders with equal props, but a context update bypasses `memo()`
  entirely and reaches every consumer.

## Requirements for the Fix

- Applying a valid coupon must update the total immediately
  (`Checkout.test.tsx` encodes this).
- Typing a gift note must NOT re-render the Order Summary (also encoded).
- Cart items, coupon, and shipping must remain shared state usable by any
  checkout section.
- Topics worth researching: `useMemo`/`useCallback` dependency arrays, why
  `memo()` cannot block context updates, stabilizing context values, and
  splitting one context into several (state vs. actions, related vs. unrelated
  state).
