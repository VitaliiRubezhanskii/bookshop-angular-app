import { createReducer, on } from '@ngrx/store';
import * as ProductActions from './products.actions';
import { Product } from './products.actions';

/**
 * NgRx Reducer for Products
 *
 * Reducers are pure functions that take the current state and an action,
 * and return a new state. They NEVER mutate state directly.
 *
 * Java equivalent: Think of it like a Stream reduce operation
 * state.reduce((accumulator, action) => newState)
 */

// State interface
export interface ProductsState {
  products: Product[];
  selectedProductId: number | null;
  loading: boolean;
  error: string | null;
}

// Initial state
export const initialProductsState: ProductsState = {
  products: [],
  selectedProductId: null,
  loading: false,
  error: null,
};

// Reducer function using createReducer
export const productsReducer = createReducer(
  initialProductsState,

  // Handle load action - set loading true
  on(ProductActions.loadProducts, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  // Handle success - update products
  on(ProductActions.loadProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    loading: false,
  })),

  // Handle failure - set error
  on(ProductActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Select product
  on(ProductActions.selectProduct, (state, { productId }) => ({
    ...state,
    selectedProductId: productId,
  })),

  // Clear selection
  on(ProductActions.clearSelectedProduct, (state) => ({
    ...state,
    selectedProductId: null,
  }))
);
