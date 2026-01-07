import { createAction, props } from '@ngrx/store';

/**
 * NgRx Actions for Products
 *
 * Actions are events that describe what happened in the application.
 * They follow the pattern: [Source] Event Description
 */

// Load products actions (Command → Event pattern)
export const loadProducts = createAction(
  '[Products Page] Load Products'
);

export const loadProductsSuccess = createAction(
  '[Products API] Load Products Success',
  props<{ products: Product[] }>()
);

export const loadProductsFailure = createAction(
  '[Products API] Load Products Failure',
  props<{ error: string }>()
);

// Single product actions
export const selectProduct = createAction(
  '[Products Page] Select Product',
  props<{ productId: number }>()
);

export const clearSelectedProduct = createAction(
  '[Products Page] Clear Selected Product'
);

// Product interface (would typically be in a models folder)
export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  category?: string;
}
