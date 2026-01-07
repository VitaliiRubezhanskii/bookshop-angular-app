import { createAction, props } from '@ngrx/store';

/**
 * NgRx Actions for Cart
 *
 * Cart actions follow CRUD-like patterns:
 * - Add, Remove, Update operations
 * - Clear for bulk operations
 */

// Cart item interface
export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

// Add item to cart
export const addToCart = createAction(
  '[Product Card] Add To Cart',
  props<{ item: Omit<CartItem, 'quantity'> }>()
);

// Remove item from cart
export const removeFromCart = createAction(
  '[Cart Page] Remove From Cart',
  props<{ productId: number }>()
);

// Update item quantity
export const updateCartItemQuantity = createAction(
  '[Cart Page] Update Quantity',
  props<{ productId: number; quantity: number }>()
);

// Increment quantity
export const incrementQuantity = createAction(
  '[Cart Page] Increment Quantity',
  props<{ productId: number }>()
);

// Decrement quantity
export const decrementQuantity = createAction(
  '[Cart Page] Decrement Quantity',
  props<{ productId: number }>()
);

// Clear entire cart
export const clearCart = createAction(
  '[Cart Page] Clear Cart'
);

// Load cart from storage (for persistence)
export const loadCart = createAction(
  '[App Init] Load Cart'
);

export const loadCartSuccess = createAction(
  '[Storage] Load Cart Success',
  props<{ items: CartItem[] }>()
);
