import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductsState } from './products.reducer';

/**
 * NgRx Selectors for Products
 *
 * Selectors are pure functions that extract slices of state.
 * They are memoized - they only recompute when their inputs change.
 *
 * Java equivalent: Think of them like derived getters or computed properties
 */

// Feature selector - selects the products slice from root state
export const selectProductsState = createFeatureSelector<ProductsState>('products');

// Basic selectors
export const selectAllProducts = createSelector(
  selectProductsState,
  (state) => state.products
);

export const selectProductsLoading = createSelector(
  selectProductsState,
  (state) => state.loading
);

export const selectProductsError = createSelector(
  selectProductsState,
  (state) => state.error
);

export const selectSelectedProductId = createSelector(
  selectProductsState,
  (state) => state.selectedProductId
);

// Composed selectors (derived data)
export const selectSelectedProduct = createSelector(
  selectAllProducts,
  selectSelectedProductId,
  (products, selectedId) => products.find((p) => p.id === selectedId) || null
);

export const selectProductCount = createSelector(
  selectAllProducts,
  (products) => products.length
);

// Parameterized selector (factory function)
export const selectProductById = (productId: number) =>
  createSelector(selectAllProducts, (products) =>
    products.find((p) => p.id === productId)
  );

// Filtered products selector
export const selectProductsByCategory = (category: string) =>
  createSelector(selectAllProducts, (products) =>
    products.filter((p) => p.category === category)
  );
