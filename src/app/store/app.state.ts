import { ActionReducerMap } from '@ngrx/store';
import { ProductsState, productsReducer } from './products/products.reducer';
import { CartState, cartReducer } from './cart/cart.reducer';

/**
 * Root Application State
 *
 * This defines the shape of the entire application state tree.
 * Each feature has its own slice of state.
 */

export interface AppState {
  products: ProductsState;
  cart: CartState;
}

/**
 * Root Reducers
 *
 * Maps each state slice to its reducer function.
 */
export const reducers: ActionReducerMap<AppState> = {
  products: productsReducer,
  cart: cartReducer,
};
