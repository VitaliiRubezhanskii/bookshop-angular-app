/**
 * NgRx Learning Examples for Java Developers
 *
 * NgRx is Angular's Redux-inspired state management library.
 * Think of it like: Flux/Redux pattern or Event Sourcing in Java
 *
 * Core Concepts:
 * - Store: Single source of truth (like a database)
 * - Actions: Events describing what happened (like Domain Events)
 * - Reducers: Pure functions that update state (like Event Handlers)
 * - Selectors: Queries to read state (like Repository queries)
 * - Effects: Side effects like API calls (like Application Services)
 */

import { createAction, props, createReducer, on, createSelector, createFeatureSelector, Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, mergeMap, catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';


// ============================================================
// LEVEL 1: CORE CONCEPTS OVERVIEW
// ============================================================

/**
 * NgRx vs Java/Backend Patterns Comparison
 *
 * | NgRx Concept | Java Equivalent              | Purpose                    |
 * |--------------|------------------------------|----------------------------|
 * | Store        | Database / Application State | Single source of truth     |
 * | Action       | Domain Event / Command       | Describes what happened    |
 * | Reducer      | Event Handler                | Updates state (pure)       |
 * | Selector     | Repository Query / DTO       | Reads/derives state        |
 * | Effect       | Application Service          | Side effects (API calls)   |
 *
 * Data Flow (Unidirectional):
 *
 *   Component ──dispatch──► Action ──► Reducer ──► Store ──► Selector ──► Component
 *                              │
 *                              └──► Effect ──► API ──► Action
 *
 * Why NgRx?
 * - Predictable state (one source of truth)
 * - Time-travel debugging
 * - Separation of concerns
 * - Testable (pure functions)
 */


// ============================================================
// LEVEL 2: ACTIONS - Describing What Happened
// ============================================================

/**
 * ACTIONS - Events that describe something that happened
 *
 * Naming Convention: [Source] Event Description
 * - [Products Page] Load Products
 * - [Products API] Load Products Success
 * - [Products API] Load Products Failure
 *
 * Java equivalent: Domain Events
 *   class ProductsLoadedEvent { List<Product> products; }
 */

// Simple action (no payload)
export const loadProducts = createAction(
  '[Products Page] Load Products'
);

// Action with payload using props
export const loadProductsSuccess = createAction(
  '[Products API] Load Products Success',
  props<{ products: Product[] }>()
);

export const loadProductsFailure = createAction(
  '[Products API] Load Products Failure',
  props<{ error: string }>()
);

// More action examples
export const addToCart = createAction(
  '[Product Card] Add To Cart',
  props<{ product: Product; quantity: number }>()
);

export const removeFromCart = createAction(
  '[Cart Page] Remove From Cart',
  props<{ productId: number }>()
);

export const updateCartQuantity = createAction(
  '[Cart Page] Update Quantity',
  props<{ productId: number; quantity: number }>()
);

export const clearCart = createAction(
  '[Checkout] Clear Cart'
);

// User actions
export const login = createAction(
  '[Login Page] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth API] Login Success',
  props<{ user: User }>()
);

export const loginFailure = createAction(
  '[Auth API] Login Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Header] Logout');


// ============================================================
// LEVEL 3: STATE - Defining the Shape
// ============================================================

/**
 * STATE - The shape of your application data
 *
 * Think of this as your database schema.
 * Each feature module typically has its own slice of state.
 *
 * Java equivalent: Entity / Aggregate Root
 */

// Products state
export interface ProductsState {
  products: Product[];
  selectedProductId: number | null;
  loading: boolean;
  error: string | null;
}

export const initialProductsState: ProductsState = {
  products: [],
  selectedProductId: null,
  loading: false,
  error: null
};

// Cart state
export interface CartState {
  items: CartItem[];
  loading: boolean;
}

export const initialCartState: CartState = {
  items: [],
  loading: false
};

// User state
export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const initialUserState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

// Root application state (combines all feature states)
export interface AppState {
  products: ProductsState;
  cart: CartState;
  user: UserState;
}


// ============================================================
// LEVEL 4: REDUCERS - Updating State (Pure Functions)
// ============================================================

/**
 * REDUCERS - Pure functions that take current state + action, return new state
 *
 * Rules:
 * 1. NEVER mutate state directly - always return new object
 * 2. Must be pure (same input = same output, no side effects)
 * 3. Handle unknown actions by returning current state
 *
 * Java equivalent: Event Handler / State Machine
 *   State handle(State current, Event event) { return newState; }
 */

// Products reducer
export const productsReducer = createReducer(
  initialProductsState,

  // When load starts, set loading true
  on(loadProducts, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  // When load succeeds, store products
  on(loadProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    loading: false
  })),

  // When load fails, store error
  on(loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);

// Cart reducer
export const cartReducer = createReducer(
  initialCartState,

  on(addToCart, (state, { product, quantity }) => {
    const existingItem = state.items.find(item => item.productId === product.id);

    if (existingItem) {
      // Update quantity if already in cart
      return {
        ...state,
        items: state.items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      };
    } else {
      // Add new item
      return {
        ...state,
        items: [...state.items, {
          productId: product.id,
          name: product.name,
          unitPrice: product.unitPrice,
          quantity
        }]
      };
    }
  }),

  on(removeFromCart, (state, { productId }) => ({
    ...state,
    items: state.items.filter(item => item.productId !== productId)
  })),

  on(updateCartQuantity, (state, { productId, quantity }) => ({
    ...state,
    items: state.items.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    )
  })),

  on(clearCart, (state) => ({
    ...state,
    items: []
  }))
);

// User reducer
export const userReducer = createReducer(
  initialUserState,

  on(login, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(loginSuccess, (state, { user }) => ({
    ...state,
    currentUser: user,
    isAuthenticated: true,
    loading: false
  })),

  on(loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(logout, () => initialUserState)
);


// ============================================================
// LEVEL 5: SELECTORS - Querying State Efficiently
// ============================================================

/**
 * SELECTORS - Pure functions to query and derive state
 *
 * Benefits:
 * - Memoized (cached) - only recalculates when input changes
 * - Composable - build complex selectors from simple ones
 * - Testable - pure functions
 *
 * Java equivalent: Repository queries / DTOs
 *   List<ProductDTO> findActiveProducts();
 */

// Feature selectors (get the feature slice)
export const selectProductsState = createFeatureSelector<ProductsState>('products');
export const selectCartState = createFeatureSelector<CartState>('cart');
export const selectUserState = createFeatureSelector<UserState>('user');

// Products selectors
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

// Derived selector - get selected product
export const selectSelectedProduct = createSelector(
  selectAllProducts,
  selectSelectedProductId,
  (products, selectedId) => products.find(p => p.id === selectedId) || null
);

// Parameterized selector - get product by ID
export const selectProductById = (productId: number) => createSelector(
  selectAllProducts,
  (products) => products.find(p => p.id === productId)
);

// Cart selectors
export const selectCartItems = createSelector(
  selectCartState,
  (state) => state.items
);

export const selectCartItemCount = createSelector(
  selectCartItems,
  (items) => items.reduce((total, item) => total + item.quantity, 0)
);

export const selectCartSubtotal = createSelector(
  selectCartItems,
  (items) => items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0)
);

export const selectCartTax = createSelector(
  selectCartSubtotal,
  (subtotal) => subtotal * 0.10  // 10% tax
);

export const selectCartTotal = createSelector(
  selectCartSubtotal,
  selectCartTax,
  (subtotal, tax) => subtotal + tax
);

// User selectors
export const selectCurrentUser = createSelector(
  selectUserState,
  (state) => state.currentUser
);

export const selectIsAuthenticated = createSelector(
  selectUserState,
  (state) => state.isAuthenticated
);

// Combined selectors (cross-feature)
export const selectCartSummary = createSelector(
  selectCartItems,
  selectCartSubtotal,
  selectCartTax,
  selectCartTotal,
  (items, subtotal, tax, total) => ({
    itemCount: items.length,
    subtotal,
    tax,
    total
  })
);


// ============================================================
// LEVEL 6: EFFECTS - Side Effects (API Calls)
// ============================================================

/**
 * EFFECTS - Handle side effects like API calls
 *
 * Flow: Action dispatched → Effect listens → API call → Dispatch new action
 *
 * Think of Effects as Application Services that:
 * 1. Listen for specific actions
 * 2. Perform async operations (HTTP, etc.)
 * 3. Dispatch success/failure actions
 *
 * Java equivalent: Application Service / Use Case
 *   class LoadProductsUseCase { void execute() { ... } }
 */

@Injectable()
export class ProductsEffects {

  constructor(
    private actions$: Actions,
    private http: HttpClient
  ) {}

  /**
   * Effect: Load products from API
   *
   * Listens for: loadProducts action
   * Dispatches: loadProductsSuccess or loadProductsFailure
   */
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProducts),                          // Listen for this action
      switchMap(() =>                                 // switchMap cancels previous
        this.http.get<Product[]>('/api/products').pipe(
          map(products => loadProductsSuccess({ products })),  // Success → dispatch
          catchError(error => of(loadProductsFailure({ error: error.message })))  // Error → dispatch
        )
      )
    )
  );

  /**
   * Effect: Log errors (no dispatch)
   *
   * Using { dispatch: false } for side effects that don't dispatch actions
   */
  logError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProductsFailure),
      tap(({ error }) => console.error('Products load failed:', error))
    ),
    { dispatch: false }  // Don't dispatch any action
  );
}

@Injectable()
export class CartEffects {

  constructor(
    private actions$: Actions,
    private store: Store
  ) {}

  /**
   * Effect: Save cart to localStorage
   */
  saveCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addToCart, removeFromCart, updateCartQuantity, clearCart),
      withLatestFrom(this.store.select(selectCartItems)),
      tap(([_, items]) => {
        localStorage.setItem('cart', JSON.stringify(items));
      })
    ),
    { dispatch: false }
  );

  /**
   * Effect: Show notification on add to cart
   */
  addToCartNotification$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addToCart),
      tap(({ product }) => {
        // Show toast notification
        console.log(`Added ${product.name} to cart!`);
      })
    ),
    { dispatch: false }
  );
}

@Injectable()
export class AuthEffects {

  constructor(
    private actions$: Actions,
    private http: HttpClient
  ) {}

  /**
   * Effect: Login API call
   */
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      switchMap(({ email, password }) =>
        this.http.post<User>('/api/auth/login', { email, password }).pipe(
          map(user => loginSuccess({ user })),
          catchError(error => of(loginFailure({ error: error.message })))
        )
      )
    )
  );

  /**
   * Effect: Redirect after login success
   */
  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginSuccess),
      tap(({ user }) => {
        localStorage.setItem('user', JSON.stringify(user));
        // this.router.navigate(['/products']);
      })
    ),
    { dispatch: false }
  );

  /**
   * Effect: Clear storage on logout
   */
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      tap(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
      })
    ),
    { dispatch: false }
  );
}


// ============================================================
// LEVEL 7: USING STORE IN COMPONENTS
// ============================================================

/**
 * Using NgRx Store in Components
 *
 * Inject Store, use selectors to read, dispatch actions to write
 */

// Example component (pseudo-code)
export class ExampleProductListComponent {
  // Inject store
  // constructor(private store: Store) {}

  // Select state using selectors (returns Observable)
  // products$ = this.store.select(selectAllProducts);
  // loading$ = this.store.select(selectProductsLoading);
  // error$ = this.store.select(selectProductsError);

  // Dispatch actions
  // ngOnInit() {
  //   this.store.dispatch(loadProducts());
  // }

  // addToCart(product: Product) {
  //   this.store.dispatch(addToCart({ product, quantity: 1 }));
  // }
}

// Template usage:
// <div *ngIf="loading$ | async">Loading...</div>
// <div *ngIf="error$ | async as error">Error: {{ error }}</div>
// <div *ngFor="let product of products$ | async">
//   {{ product.name }} - {{ product.unitPrice | currency }}
//   <button (click)="addToCart(product)">Add to Cart</button>
// </div>


// ============================================================
// LEVEL 8: ENTITY ADAPTER - Managing Collections
// ============================================================

/**
 * ENTITY ADAPTER - Utility for managing collections of entities
 *
 * Provides:
 * - Normalized state shape { ids: [], entities: {} }
 * - CRUD operations (addOne, addMany, updateOne, removeOne, etc.)
 * - Built-in selectors (selectAll, selectTotal, selectEntities)
 *
 * Java equivalent: JPA Repository methods
 */

// Create adapter for Product entity
export const productAdapter: EntityAdapter<Product> = createEntityAdapter<Product>({
  selectId: (product) => product.id,  // Which property is the ID
  sortComparer: (a, b) => a.name.localeCompare(b.name)  // Optional: sort by name
});

// Entity state shape
export interface ProductEntityState extends EntityState<Product> {
  // Additional state beyond entities
  selectedProductId: number | null;
  loading: boolean;
  error: string | null;
}

// Initial state using adapter
export const initialProductEntityState: ProductEntityState = productAdapter.getInitialState({
  selectedProductId: null,
  loading: false,
  error: null
});

// Reducer using adapter methods
export const productEntityReducer = createReducer(
  initialProductEntityState,

  on(loadProductsSuccess, (state, { products }) =>
    productAdapter.setAll(products, { ...state, loading: false })
  ),

  // Add single product
  on(createProductSuccess, (state, { product }) =>
    productAdapter.addOne(product, state)
  ),

  // Update product
  on(updateProductSuccess, (state, { product }) =>
    productAdapter.updateOne({ id: product.id, changes: product }, state)
  ),

  // Remove product
  on(deleteProductSuccess, (state, { productId }) =>
    productAdapter.removeOne(productId, state)
  )
);

// Additional actions for entity operations
export const createProductSuccess = createAction(
  '[Products API] Create Product Success',
  props<{ product: Product }>()
);

export const updateProductSuccess = createAction(
  '[Products API] Update Product Success',
  props<{ product: Product }>()
);

export const deleteProductSuccess = createAction(
  '[Products API] Delete Product Success',
  props<{ productId: number }>()
);

// Entity selectors (built-in)
const { selectAll, selectEntities, selectIds, selectTotal } = productAdapter.getSelectors();

export const selectProductEntities = createSelector(
  selectProductsState,
  selectEntities
);

export const selectAllProductEntities = createSelector(
  selectProductsState,
  selectAll
);

export const selectProductCount = createSelector(
  selectProductsState,
  selectTotal
);


// ============================================================
// LEVEL 9: COMPONENT STORE - Local State Management
// ============================================================

/**
 * COMPONENT STORE - Simpler state management for component-level state
 *
 * Use when:
 * - State is local to a component (not shared globally)
 * - You want reactive state without full NgRx setup
 * - Managing form state, UI state, etc.
 *
 * Think of it as a mini-Redux for a single component.
 */

// import { ComponentStore } from '@ngrx/component-store';

interface ProductSearchState {
  searchTerm: string;
  filters: {
    category: string;
    minPrice: number;
    maxPrice: number;
  };
  results: Product[];
  loading: boolean;
}

// @Injectable()
// export class ProductSearchStore extends ComponentStore<ProductSearchState> {
//
//   constructor(private http: HttpClient) {
//     super({
//       searchTerm: '',
//       filters: { category: 'all', minPrice: 0, maxPrice: 1000 },
//       results: [],
//       loading: false
//     });
//   }
//
//   // Selectors
//   readonly searchTerm$ = this.select(state => state.searchTerm);
//   readonly filters$ = this.select(state => state.filters);
//   readonly results$ = this.select(state => state.results);
//   readonly loading$ = this.select(state => state.loading);
//
//   // Combined selector
//   readonly vm$ = this.select(
//     this.searchTerm$,
//     this.filters$,
//     this.results$,
//     this.loading$,
//     (searchTerm, filters, results, loading) => ({
//       searchTerm, filters, results, loading
//     })
//   );
//
//   // Updaters (synchronous state changes)
//   readonly setSearchTerm = this.updater((state, searchTerm: string) => ({
//     ...state,
//     searchTerm
//   }));
//
//   readonly setFilters = this.updater((state, filters: Partial<ProductSearchState['filters']>) => ({
//     ...state,
//     filters: { ...state.filters, ...filters }
//   }));
//
//   // Effects (async operations)
//   readonly search = this.effect((trigger$: Observable<void>) =>
//     trigger$.pipe(
//       withLatestFrom(this.searchTerm$, this.filters$),
//       tap(() => this.patchState({ loading: true })),
//       switchMap(([_, term, filters]) =>
//         this.http.get<Product[]>(`/api/products/search?q=${term}`).pipe(
//           tap(results => this.patchState({ results, loading: false })),
//           catchError(() => {
//             this.patchState({ loading: false });
//             return EMPTY;
//           })
//         )
//       )
//     )
//   );
// }


// ============================================================
// LEVEL 10: BEST PRACTICES & PATTERNS
// ============================================================

/**
 * BEST PRACTICES
 *
 * 1. Action Hygiene
 *    - Use past tense for events: "Products Loaded" not "Load Products"
 *    - Include source in brackets: [Products Page], [Products API]
 *    - One action per user interaction
 *
 * 2. Reducer Rules
 *    - Keep reducers pure (no side effects)
 *    - Never mutate state - always spread
 *    - Handle all actions explicitly or return current state
 *
 * 3. Selector Best Practices
 *    - Compose selectors from smaller ones
 *    - Use memoization (built-in with createSelector)
 *    - Keep selectors close to their feature state
 *
 * 4. Effect Patterns
 *    - Use switchMap for "latest" (search, navigation)
 *    - Use mergeMap for "all" (bulk operations)
 *    - Use concatMap for "ordered" (sequential saves)
 *    - Use exhaustMap for "ignore new" (form submit)
 *
 * 5. State Shape
 *    - Normalize nested data (use entity adapter)
 *    - Store IDs as references, not objects
 *    - Include loading/error state for async operations
 */

// ============================================================
// SUMMARY: NgRx Cheat Sheet
// ============================================================
/*

STORE SETUP:
┌────────────────────────────────────────────────────────────────┐
│  StoreModule.forRoot({ products: productsReducer, ... })       │
│  EffectsModule.forRoot([ProductsEffects, CartEffects, ...])    │
└────────────────────────────────────────────────────────────────┘

ACTION PATTERNS:
┌────────────────────────────────────────────────────────────────┐
│  createAction('[Source] Event')                                │
│  createAction('[Source] Event', props<{ data: T }>())          │
└────────────────────────────────────────────────────────────────┘

REDUCER PATTERN:
┌────────────────────────────────────────────────────────────────┐
│  createReducer(                                                │
│    initialState,                                               │
│    on(action1, (state) => ({ ...state, loading: true })),      │
│    on(action2, (state, { data }) => ({ ...state, data }))      │
│  )                                                             │
└────────────────────────────────────────────────────────────────┘

SELECTOR PATTERN:
┌────────────────────────────────────────────────────────────────┐
│  selectFeature = createFeatureSelector<State>('feature')       │
│  selectData = createSelector(selectFeature, s => s.data)       │
│  selectDerived = createSelector(selectA, selectB, (a,b) => ..) │
└────────────────────────────────────────────────────────────────┘

EFFECT PATTERN:
┌────────────────────────────────────────────────────────────────┐
│  effect$ = createEffect(() =>                                  │
│    this.actions$.pipe(                                         │
│      ofType(triggerAction),                                    │
│      switchMap(() => this.http.get(...).pipe(                  │
│        map(data => successAction({ data })),                   │
│        catchError(err => of(failureAction({ error })))         │
│      ))                                                        │
│    )                                                           │
│  )                                                             │
└────────────────────────────────────────────────────────────────┘

COMPONENT USAGE:
┌────────────────────────────────────────────────────────────────┐
│  // Read state                                                 │
│  data$ = this.store.select(selectData);                        │
│                                                                │
│  // Write state                                                │
│  this.store.dispatch(action({ payload }));                     │
│                                                                │
│  // Template                                                   │
│  <div *ngIf="data$ | async as data">{{ data }}</div>           │
└────────────────────────────────────────────────────────────────┘

WHEN TO USE NGRX:
┌────────────────────────────────────────────────────────────────┐
│  ✓ Shared state between multiple components                   │
│  ✓ Complex state with many interactions                       │
│  ✓ State that needs to be persisted/rehydrated                │
│  ✓ Need for undo/redo functionality                           │
│  ✓ Team needs clear patterns for state management             │
│                                                                │
│  ✗ Simple app with minimal shared state                       │
│  ✗ Component-local state (use ComponentStore instead)         │
│  ✗ Server-state that could use simpler caching                │
└────────────────────────────────────────────────────────────────┘

*/


// ============================================================
// Type Definitions
// ============================================================

interface Product {
  id: number;
  name: string;
  unitPrice: number;
  categoryId: number;
  imageUrl?: string;
  description?: string;
}

interface CartItem {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
}

interface User {
  id: number;
  email: string;
  name: string;
}
