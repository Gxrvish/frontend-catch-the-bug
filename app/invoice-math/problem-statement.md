# Invoice Math Problem Statement

## Context

`invoice.ts` computes line totals, the invoice total, and the
free-shipping check — all in floating-point dollars. Two tickets from a
billing-scale company. Different symptoms, one disease.

## Ticket A — "A $20.00 cart doesn't get free shipping"

Free shipping starts at $20. A customer's cart — $1.60 + $8.95 + $5.50 +
$3.95 — is *exactly* $20.00, and the banner says no. Finance re-added it
on a calculator three times. The code says the total is
`19.999999999999996`.

## Ticket B — "The invoice rounds half a cent the wrong way"

1.5 hours of support at $2.67/hr is $4.005 — billing policy (and every
accountant) rounds the half cent **up**: $4.01. The invoice prints $4.00.
Auditors flagged it.

## Fast Reproduction Path

1. Open `/invoice-math` → free shipping says "no" for the first four
   items summing to exactly $20.00 (Ticket A).
2. The "Support (hrs)" line prints 4.00, not 4.01 (Ticket B).

## Root Cause Hints

Binary floating point cannot represent most decimal fractions. `0.1` is
not one-tenth; it's the nearest binary fraction. Money math in floats
inherits that error:

- **A:** each price is already slightly off, and `reduce(+)` accumulates
  the error — four exact-cents prices sum to just *below* 20, and
  `>= 20` misses. Comparing money in floats compares noise.
- **B:** `2.67 * 1.5` in binary is a hair **under** 4.005, so
  `toFixed(2)` — which rounds what the float actually is, not what the
  decimal looks like — goes down to 4.00.
- The standard cure is the same for both: do money arithmetic in **integer
  cents** (convert once at the boundary with a guarded
  `Math.round(price * 100)`), and only divide by 100 for display.

## Requirements for the Fix

- A cart worth exactly the threshold qualifies for free shipping (Red A).
- $2.67 × 1.5 prints as 4.01 (Red B).
- Whole-dollar lines still total exactly (guard).
- Research topics: IEEE-754 binary floating point vs decimal fractions,
  why `0.1 + 0.2 !== 0.3`, `toFixed` rounding on inexact values, and
  integer-cents (minor-units) money arithmetic.
