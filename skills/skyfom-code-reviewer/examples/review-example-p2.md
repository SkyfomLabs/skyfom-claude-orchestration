# Example: P2 Code Quality Issue Review

## PR #458: Add discount calculation feature

### Issue Found: Complex Function & Missing Tests

**File**: `src/utils/discount.ts:12`
**Severity**: P2 (MAJOR)
**Category**: Code Quality

#### Problematic Code
```typescript
function calculateDiscount(price: number, userType: string, quantity: number, promoCode?: string) {
  let discount = 0;

  if (userType === 'premium') {
    if (quantity > 10) {
      discount = 0.15;
      if (quantity > 50) {
        discount = 0.25;
        if (quantity > 100) {
          discount = 0.35;
        }
      }
    } else {
      discount = 0.10;
    }
  } else if (userType === 'regular') {
    if (quantity > 20) {
      discount = 0.10;
    } else {
      discount = 0.05;
    }
  }

  if (promoCode) {
    if (promoCode === 'SAVE20') {
      discount += 0.20;
    } else if (promoCode === 'SAVE10') {
      discount += 0.10;
    } else if (promoCode === 'VIP') {
      discount += 0.30;
    }
  }

  const discountedPrice = price - (price * discount);

  return discountedPrice < 0 ? 0 : discountedPrice;
}
```

#### Problems Identified

1. **High Complexity** (Cyclomatic Complexity: 11)
   - Too many nested conditions
   - Hard to understand and maintain
   - Difficult to test all paths

2. **Deep Nesting** (4 levels)
   - Reduces readability
   - Makes logic hard to follow

3. **Magic Numbers**
   - Discount rates hardcoded
   - No explanation of business rules

4. **Missing Validation**
   - No check for negative prices
   - No validation of userType
   - No max discount limit

5. **Missing Tests**
   - No edge case tests
   - No tests for discount combinations
   - No tests for invalid inputs

#### Fix (Automatic Suggestion)
```typescript
// Constants for business rules
const DISCOUNT_RATES = {
  premium: {
    base: 0.10,
    tier2: { threshold: 10, rate: 0.15 },
    tier3: { threshold: 50, rate: 0.25 },
    tier4: { threshold: 100, rate: 0.35 },
  },
  regular: {
    base: 0.05,
    tier2: { threshold: 20, rate: 0.10 },
  },
} as const;

const PROMO_CODES = {
  SAVE20: 0.20,
  SAVE10: 0.10,
  VIP: 0.30,
} as const;

const MAX_DISCOUNT = 0.70; // Never discount more than 70%

// Type definitions
type UserType = 'premium' | 'regular';
type PromoCode = keyof typeof PROMO_CODES;

interface DiscountResult {
  originalPrice: number;
  discount: number;
  finalPrice: number;
  discountBreakdown: {
    tierDiscount: number;
    promoDiscount: number;
  };
}

// Main function - simplified and clear
function calculateDiscount(
  price: number,
  userType: UserType,
  quantity: number,
  promoCode?: PromoCode
): DiscountResult {
  // Validation
  if (price < 0) {
    throw new Error('Price cannot be negative');
  }
  if (quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }

  // Calculate discounts separately
  const tierDiscount = getTierDiscount(userType, quantity);
  const promoDiscount = getPromoDiscount(promoCode);

  // Combine discounts with cap
  const totalDiscount = Math.min(
    tierDiscount + promoDiscount,
    MAX_DISCOUNT
  );

  const finalPrice = price * (1 - totalDiscount);

  return {
    originalPrice: price,
    discount: totalDiscount,
    finalPrice,
    discountBreakdown: {
      tierDiscount,
      promoDiscount,
    },
  };
}

// Extract tier discount logic
function getTierDiscount(userType: UserType, quantity: number): number {
  const tiers = DISCOUNT_RATES[userType];

  // Check tiers from highest to lowest
  if ('tier4' in tiers && quantity >= tiers.tier4.threshold) {
    return tiers.tier4.rate;
  }
  if ('tier3' in tiers && quantity >= tiers.tier3.threshold) {
    return tiers.tier3.rate;
  }
  if ('tier2' in tiers && quantity >= tiers.tier2.threshold) {
    return tiers.tier2.rate;
  }

  return tiers.base;
}

// Extract promo discount logic
function getPromoDiscount(promoCode?: PromoCode): number {
  if (!promoCode) return 0;
  return PROMO_CODES[promoCode] ?? 0;
}

// Example usage with better return type
const result = calculateDiscount(100, 'premium', 15, 'SAVE10');
// {
//   originalPrice: 100,
//   discount: 0.25,
//   finalPrice: 75,
//   discountBreakdown: { tierDiscount: 0.15, promoDiscount: 0.10 }
// }
```

#### Required Tests
```typescript
// tests/utils/discount.test.ts
import { describe, it, expect } from 'vitest';
import { calculateDiscount } from './discount';

describe('calculateDiscount', () => {
  describe('premium users', () => {
    it('applies base discount for quantities <= 10', () => {
      const result = calculateDiscount(100, 'premium', 5);
      expect(result.finalPrice).toBe(90); // 10% off
    });

    it('applies tier2 discount for quantities > 10', () => {
      const result = calculateDiscount(100, 'premium', 15);
      expect(result.finalPrice).toBe(85); // 15% off
    });

    it('applies tier3 discount for quantities > 50', () => {
      const result = calculateDiscount(100, 'premium', 75);
      expect(result.finalPrice).toBe(75); // 25% off
    });

    it('applies tier4 discount for quantities > 100', () => {
      const result = calculateDiscount(100, 'premium', 150);
      expect(result.finalPrice).toBe(65); // 35% off
    });
  });

  describe('regular users', () => {
    it('applies base discount for quantities <= 20', () => {
      const result = calculateDiscount(100, 'regular', 10);
      expect(result.finalPrice).toBe(95); // 5% off
    });

    it('applies tier2 discount for quantities > 20', () => {
      const result = calculateDiscount(100, 'regular', 25);
      expect(result.finalPrice).toBe(90); // 10% off
    });
  });

  describe('promo codes', () => {
    it('applies SAVE20 promo code', () => {
      const result = calculateDiscount(100, 'regular', 1, 'SAVE20');
      expect(result.finalPrice).toBe(75); // 5% base + 20% promo = 25%
    });

    it('caps total discount at MAX_DISCOUNT', () => {
      const result = calculateDiscount(100, 'premium', 150, 'VIP');
      // 35% tier + 30% promo = 65%, but capped at 70%
      expect(result.discount).toBe(0.70);
      expect(result.finalPrice).toBe(30);
    });
  });

  describe('edge cases', () => {
    it('throws error for negative price', () => {
      expect(() => calculateDiscount(-100, 'regular', 1)).toThrow('Price cannot be negative');
    });

    it('throws error for zero quantity', () => {
      expect(() => calculateDiscount(100, 'regular', 0)).toThrow('Quantity must be at least 1');
    });

    it('handles invalid promo code gracefully', () => {
      const result = calculateDiscount(100, 'regular', 1, 'INVALID' as any);
      expect(result.promoDiscount).toBe(0);
    });
  });

  describe('discount breakdown', () => {
    it('provides breakdown of tier and promo discounts', () => {
      const result = calculateDiscount(100, 'premium', 15, 'SAVE10');
      expect(result.discountBreakdown).toEqual({
        tierDiscount: 0.15,
        promoDiscount: 0.10,
      });
    });
  });
});
```

#### Improvements Made

✅ **Complexity**: 11 → 3 (reduced by 73%)
✅ **Nesting**: 4 levels → 1 level
✅ **Magic Numbers**: Extracted to constants
✅ **Type Safety**: Added proper TypeScript types
✅ **Validation**: Added input validation
✅ **Testability**: Separated concerns, easy to test
✅ **Maintainability**: Clear business rules
✅ **Documentation**: Self-documenting code

#### Learn More
- [Cyclomatic Complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity)
- [Refactoring Complex Conditionals](https://refactoring.guru/refactoring/techniques/simplifying-conditional-expressions)
- [Clean Code Principles](https://refactoring.guru/refactoring/what-is-refactoring)

#### Action Taken
- ⚠️ **Improvements Recommended** - Non-blocking but should fix
- 🎫 Created ticket: [bd-refactor-discount-458](bd://bd-refactor-discount-458)
- ✅ Can merge, but follow-up required

---

## Review Comment Template

```markdown
## 💡 P2 Code Quality: Complex Function

**Location**: src/utils/discount.ts:12

The `calculateDiscount` function has high complexity (11) and deep nesting (4 levels).

**Issues**:
- Hard to understand and maintain
- Difficult to test all paths
- Magic numbers hardcoded
- Missing edge case validation
- No tests provided

**Suggested Refactoring**:
1. Extract constants for discount rates
2. Split into smaller functions (getTierDiscount, getPromoDiscount)
3. Add TypeScript types
4. Add input validation
5. Return structured result with breakdown

**Test Coverage Needed**:
- Edge cases (negative price, zero quantity)
- All discount tiers
- Promo code combinations
- Max discount cap

See full refactored code in ticket: [bd-refactor-discount-458](bd://bd-refactor-discount-458)

**Learn**: [Refactoring Complex Conditionals](https://refactoring.guru/refactoring/techniques/simplifying-conditional-expressions)

Non-blocking, but recommend fixing soon to prevent technical debt.
```
