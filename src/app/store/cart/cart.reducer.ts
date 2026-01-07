import { createReducer, on } from '@ngrx/store';
import * as CartActions from './cart.actions';
import { CartItem } from './cart.actions';

/**
 * NgRx Reducer for Cart
 *
 * Handles cart state mutations immutably.
 * Note how we never mutate arrays directly - always return new arrays.
 */

// State interface
export interface CartState {
  items: CartItem[];
}

// Initial state
export const initialCartState: CartState = {
  items: [],
};

// Reducer function
export const cartReducer = createReducer(
  initialCartState,

  // Add to cart - check if exists, increment or add new
  on(CartActions.addToCart, (state, { item }) => {
    const existingItem = state.items.find((i) => i.productId === item.productId);

    if (existingItem) {
      // Item exists - increment quantity
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      };
    }

    // New item - add with quantity 1
    return {
      ...state,
      items: [...state.items, { ...item, quantity: 1 }],
    };
  }),

  // Remove from cart
  on(CartActions.removeFromCart, (state, { productId }) => ({
    ...state,
    items: state.items.filter((i) => i.productId !== productId),
  })),

  // Update quantity directly
  on(CartActions.updateCartItemQuantity, (state, { productId, quantity }) => ({
    ...state,
    items: quantity > 0
      ? state.items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        )
      : state.items.filter((i) => i.productId !== productId),
  })),

  // Increment quantity
  on(CartActions.incrementQuantity, (state, { productId }) => ({
    ...state,
    items: state.items.map((i) =>
      i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
    ),
  })),

  // Decrement quantity (remove if reaches 0)
  on(CartActions.decrementQuantity, (state, { productId }) => {
    const item = state.items.find((i) => i.productId === productId);
    if (!item) return state;

    if (item.quantity <= 1) {
      // Remove item
      return {
        ...state,
        items: state.items.filter((i) => i.productId !== productId),
      };
    }

    // Decrement
    return {
      ...state,
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i
      ),
    };
  }),

  // Clear cart
  on(CartActions.clearCart, (state) => ({
    ...state,
    items: [],
  })),

  // Load cart from storage
  on(CartActions.loadCartSuccess, (state, { items }) => ({
    ...state,
    items,
  }))
);
