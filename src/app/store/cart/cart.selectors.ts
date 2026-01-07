import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CartState } from './cart.reducer';

/**
 * NgRx Selectors for Cart
 *
 * Demonstrates composed selectors for derived state.
 * These are memoized - computed values are cached until inputs change.
 */

// Feature selector
export const selectCartState = createFeatureSelector<CartState>('cart');

// Basic selectors
export const selectCartItems = createSelector(
  selectCartState,
  (state) => state.items
);

// Derived selectors (computed values)

/**
 * Total number of items in cart (sum of quantities)
 */
export const selectCartItemCount = createSelector(
  selectCartItems,
  (items) => items.reduce((sum, item) => sum + item.quantity, 0)
);

/**
 * Total price of cart
 */
export const selectCartTotal = createSelector(
  selectCartItems,
  (items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

/**
 * Number of unique products in cart
 */
export const selectCartUniqueItemCount = createSelector(
  selectCartItems,
  (items) => items.length
);

/**
 * Check if cart is empty
 */
export const selectIsCartEmpty = createSelector(
  selectCartItems,
  (items) => items.length === 0
);

/**
 * Get specific cart item by productId
 */
export const selectCartItemByProductId = (productId: number) =>
  createSelector(selectCartItems, (items) =>
    items.find((item) => item.productId === productId)
  );

/**
 * Check if product is in cart
 */
export const selectIsProductInCart = (productId: number) =>
  createSelector(selectCartItems, (items) =>
    items.some((item) => item.productId === productId)
  );

/**
 * Cart summary (for header/mini-cart display)
 */
export const selectCartSummary = createSelector(
  selectCartItemCount,
  selectCartTotal,
  (count, total) => ({ count, total })
);
