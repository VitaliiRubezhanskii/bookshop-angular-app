# BookshopAngularApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.0.2.

## Suggested Navigation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        UNAUTHENTICATED USER                         │
└─────────────────────────────────────────────────────────────────────┘

  /                          /products                /products/:id
  (root)         ──────►     (browse)      ──────►    (view details)
                                │                          │
                                │                          │
                                ▼                          ▼
                         /category/:id              [Add to Cart]
                         /search/:keyword                  │
                                                           ▼
                                                    /cart-details
                                                    (review cart)
                                                           │
                                                           ▼
                                                    /checkout ──► /login
                                                    (blocked)     (redirect)

┌─────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATED USER                          │
└─────────────────────────────────────────────────────────────────────┘

  /login                   /products              /cart-details
  (Google OAuth)  ──────►  (redirected)  ──────►  (review cart)
                                                        │
                                                        ▼
                                                   /checkout
                                                   (place order)
                                                        │
                                                        ▼
                                                  /order-history
                                                  (view orders)
```

## Recommended Primary User Journey

| Step | Route | Action |
|------|-------|--------|
| 1 | `/products` | Browse all books |
| 2 | `/category/:id` | Filter by category |
| 3 | `/search/:keyword` | Search for specific books |
| 4 | `/products/:id` | View book details |
| 5 | `/cart-details` | Review cart, adjust quantities |
| 6 | `/login` | Sign in (if not authenticated) |
| 7 | `/checkout` | Enter shipping & payment |
| 8 | `/order-history` | View past orders |

<details>
<summary><strong>Angular Concepts Used in This Project</strong></summary>

| Concept | Where Used |
|---------|------------|
| **Standalone Components** | Most components (product-list, cart-details, checkout, etc.) |
| **Services & DI** | AuthService, CartService, ProductService, etc. |
| **Routing** | app-routing.module.ts with guards, params |
| **Route Guards** | auth.guard.ts (functional guard) |
| **Reactive Forms** | CheckoutComponent with FormBuilder |
| **Template-driven Forms** | Cart quantity input with ngModel |
| **RxJS/Observables** | BehaviorSubject in CartService, user$ in AuthService |
| **Structural Directives** | *ngIf, *ngFor, @if/@else (new syntax) |
| **Pipes** | currency, number |
| **@Input/@Output** | AddressFormComponent, CreditCardFormComponent |
| **HTTP Client** | GET/POST in services |
| **Custom Validators** | Luv2ShopValidators |
| **Lifecycle Hooks** | ngOnInit in all components |

</details>

<details>
<summary><strong>Practice Tasks (Start Small → Build Up)</strong></summary>

### Level 1: Templates & Binding
1. **Add a "New" badge** - Show a "NEW" label on products added in the last 30 days using `*ngIf`
2. **Create a custom pipe** - Build a `truncate` pipe to shorten long product descriptions
3. **Add sorting** - Add buttons to sort products by price (low/high) using click events

### Level 2: Components & Communication
4. **Extract a ProductCard component** - Move product card markup into a reusable component with `@Input` for the product
5. **Add a quantity selector component** - Create a reusable +/- stepper with `@Output` to emit changes
6. **Add a star rating component** - Display product ratings with `@Input` for the rating value

### Level 3: Services & State
7. **Add wishlist feature** - Create a WishlistService with BehaviorSubject to track saved items
8. **Add recently viewed** - Track last 5 viewed products in a service with sessionStorage
9. **Add product stock check** - Show "In Stock" / "Low Stock" / "Out of Stock" based on quantity

### Level 4: Forms & Validation
10. **Add a review form** - Create a reactive form for product reviews with star rating + comment
11. **Add a custom validator** - Validate that card expiry date is in the future
12. **Add address autocomplete** - Populate city/state when zip code is entered

### Level 5: Routing & Guards
13. **Add order confirmation page** - New route `/order-confirmation/:id` after checkout
14. **Add a "checkout guard"** - Prevent checkout if cart is empty (redirect to `/products`)
15. **Add lazy loading** - Lazy load the checkout module

</details>

<details>
<summary><strong>RxJS Operators Guide (for Java Developers)</strong></summary>

### RxJS to Java Comparison

| RxJS | Java Equivalent |
|------|-----------------|
| `Observable<T>` | `Flux<T>` / `Observable<T>` (RxJava) |
| `pipe()` | Method chaining |
| `map()` | `map()` |
| `filter()` | `filter()` |
| `tap()` | `doOnNext()` / `peek()` |
| `switchMap()` | `flatMap()` with cancellation |
| `mergeMap()` | `flatMap()` |
| `subscribe()` | `subscribe()` |

---

### switchMap - Cancel previous, keep latest only

**Use case:** Search-as-you-type (cancel old search when user types more)

```typescript
searchTerm$.pipe(
  debounceTime(300),
  switchMap(term => this.http.get(`/api/search?q=${term}`))
)
```

**Visual:**
```
User types "book" fast:

Direct call (BAD):
b → HTTP ────────────────→ response "b"    (arrives last, overwrites!)
bo → HTTP ──────────→ response "bo"
boo → HTTP ────→ response "boo"
book → HTTP → response "book"              (gets overwritten by "b"!)

With switchMap (GOOD):
b → (cancelled)
bo → (cancelled)
boo → (cancelled)
book → HTTP → response "book"              (only this one runs)
```

---

### mergeMap (flatMap) - Run ALL in parallel

**Use case:** Fetch details for multiple items at once

```typescript
from([1, 2, 3]).pipe(
  mergeMap(id => this.http.get(`/api/products/${id}`))
)
```

**Visual:**
```
from([1, 2, 3]) emits:

1 → HTTP /products/1 ──────────→ Product 1
2 → HTTP /products/2 ────→ Product 2
3 → HTTP /products/3 ──────→ Product 3
    ↑
    All run in PARALLEL, order of results: whoever finishes first!
```

---

### concatMap - Run ONE at a time, sequential

**Use case:** Order-dependent operations (save parent, then children)

```typescript
from([item1, item2, item3]).pipe(
  concatMap(item => this.http.post('/api/save', item))
)
```

**Visual:**
```
item1 → HTTP POST ─────────→ done
                              ↓ (wait for completion)
                     item2 → HTTP POST ───→ done
                                             ↓ (wait)
                                    item3 → HTTP POST → done

Sequential! One at a time. Order guaranteed.
```

---

### Comparison: switchMap vs mergeMap vs concatMap

```
User clicks button 3 times quickly:

switchMap:  click1 → (cancelled)
            click2 → (cancelled)
            click3 → HTTP → result
            Only LAST one matters

mergeMap:   click1 → HTTP ────→ result1
            click2 → HTTP ──→ result2
            click3 → HTTP ───→ result3
            ALL run in parallel, ALL results

concatMap:  click1 → HTTP ───→ result1
                               click2 → HTTP ───→ result2
                                                  click3 → HTTP → result3
            One at a time, in ORDER
```

| Operator | Parallel? | Cancels? | Order? | Use For |
|----------|-----------|----------|--------|---------|
| `switchMap` | No | Yes | N/A | Search, autocomplete, route changes |
| `mergeMap` | Yes | No | Random | Bulk fetch, parallel downloads |
| `concatMap` | No | No | Preserved | Sequential saves, transactions |

---

### forkJoin - Wait for ALL to complete

**Use case:** Load dashboard data (need users AND products AND stats)

```typescript
forkJoin({
  products: this.http.get('/api/products'),
  categories: this.http.get('/api/categories'),
  user: this.http.get('/api/me')
}).pipe(
  map(({ products, categories, user }) => ({ ... }))
)
```

**Visual:**
```
products   → HTTP ─────────────→ ┐
categories → HTTP ───→           ├→ ALL done → emit combined result
user       → HTTP ────────→      ┘
                          ↑
                   Waits for SLOWEST one
```

---

### combineLatest - React to ANY change

**Use case:** Multiple filters that affect the same data

```typescript
combineLatest([category$, priceRange$, sortBy$]).pipe(
  switchMap(([category, price, sort]) =>
    this.http.get('/api/products', { params: { category, price, sort }})
  )
)
```

**Visual:**
```
category$:   "books" ─────────────── "electronics" ────────
priceRange$: "any" ───── "$10-50" ─────────────────────────
sortBy$:     "name" ────────────────────────────────────────
                ↓           ↓              ↓
combineLatest emits whenever ANY source changes
```

---

### exhaustMap - Ignore new until current completes

**Use case:** Prevent double-submit on button click

```typescript
submitOrder$.pipe(
  exhaustMap(() => this.http.post('/api/orders', order))
)
```

**Visual:**
```
click1 → HTTP ─────────────────→ done
click2 → (ignored, request in progress)
click3 → (ignored)
click4 → (ignored)
                                  click5 → HTTP → done
                                  ↑
                           Only accepted after previous completes
```

---

### Subjects - Hot Observables

| Subject | Initial Value | Replay | Use When |
|---------|---------------|--------|----------|
| `Subject` | No | No | Event bus, simple pub/sub |
| `BehaviorSubject` | Yes (required) | Last 1 | Current state (user, filters) |
| `ReplaySubject(n)` | No | Last N | Cache events, chat history |
| `AsyncSubject` | No | Last 1 | Only care about final result |

```typescript
// BehaviorSubject - most common for state
const currentUser$ = new BehaviorSubject<User>(null);
currentUser$.next(user);                    // Update
currentUser$.getValue();                    // Get current sync
currentUser$.subscribe(u => ...);           // React to changes
```

---

### takeUntil - Prevent Memory Leaks (IMPORTANT!)

```typescript
// THE Angular unsubscribe pattern
export class MyComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.someObservable$.pipe(
      takeUntil(this.destroy$)    // Auto-unsubscribe!
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

### shareReplay - Cache HTTP Responses

```typescript
// WITHOUT shareReplay: 2 subscribers = 2 HTTP requests
// WITH shareReplay: 2 subscribers = 1 HTTP request (cached)

products$ = this.http.get('/api/products').pipe(
  shareReplay(1)  // Cache last emission
);
```

---

### debounceTime vs throttleTime

```
User types "book" rapidly:

debounceTime(300):  b → bo → boo → book → [wait 300ms] → emit "book"
                    Good for: search input, form validation

throttleTime(300):  b → [emit "b"] → [ignore for 300ms] → o → [emit "o"]
                    Good for: scroll events, resize, button spam
```

---

### scan - Running State (Redux-like)

```typescript
actions$.pipe(
  scan((state, action) => {
    switch(action.type) {
      case 'ADD': return [...state, action.item];
      case 'REMOVE': return state.filter(i => i !== action.item);
    }
  }, [])
).subscribe(state => console.log('Cart:', state));
// Output: ['Book'], ['Book','Pen'], ['Pen']
```

---

### Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                     WHICH OPERATOR TO USE?                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User typing/searching?          → switchMap + debounceTime     │
│  Fetch multiple in parallel?     → mergeMap or forkJoin         │
│  Save items sequentially?        → concatMap                    │
│  Prevent double-click?           → exhaustMap                   │
│  Multiple reactive filters?      → combineLatest                │
│  Add context to event?           → withLatestFrom               │
│  Cache HTTP response?            → shareReplay(1)               │
│  Current state value?            → BehaviorSubject              │
│  Prevent memory leaks?           → takeUntil(destroy$)          │
│  Rate limit events?              → throttleTime                 │
│  Wait for input pause?           → debounceTime                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**See full examples:** `src/app/examples/rxjs-examples.ts`

**Try interactive playground:** `http://localhost:4200/rxjs-playground`

---

### Readiness Self-Check

Test your RxJS knowledge - can you predict the output?

<details>
<summary><strong>Quiz 1: What does this output?</strong></summary>

```typescript
of(1, 2, 3).pipe(
  map(x => x * 10),
  toArray()
).subscribe(result => console.log(result));
```

**Answer:** `[10, 20, 30]`

</details>

<details>
<summary><strong>Quiz 2: switchMap vs mergeMap - what's the difference?</strong></summary>

```typescript
// User clicks 3 times quickly
clicks$.pipe(switchMap(() => http.get('/api'))).subscribe();
clicks$.pipe(mergeMap(() => http.get('/api'))).subscribe();
```

**Answer:**
- `switchMap`: Only 1 request (cancels previous) - last click wins
- `mergeMap`: 3 requests in parallel - all clicks processed

</details>

<details>
<summary><strong>Quiz 3: Why use BehaviorSubject over Subject?</strong></summary>

**Answer:** `BehaviorSubject` has an initial value and new subscribers immediately receive the current value. Use it for state (current user, current filters).

```typescript
const user$ = new BehaviorSubject<User>(null);
user$.subscribe(u => ...); // Immediately gets null
user$.next(loggedInUser);  // All subscribers get loggedInUser
```

</details>

<details>
<summary><strong>Quiz 4: What's wrong with this code?</strong></summary>

```typescript
export class MyComponent {
  ngOnInit() {
    interval(1000).subscribe(x => console.log(x));
  }
}
```

**Answer:** Memory leak! The subscription never unsubscribes. Fix with `takeUntil`:

```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  interval(1000).pipe(takeUntil(this.destroy$)).subscribe();
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

</details>

<details>
<summary><strong>Quiz 5: forkJoin vs combineLatest?</strong></summary>

**Answer:**
- `forkJoin`: Emits ONCE when ALL complete (like Promise.all)
- `combineLatest`: Emits EVERY TIME any source emits

Use `forkJoin` for one-time data loading, `combineLatest` for reactive filters.

</details>

</details>

<details>
<summary><strong>NgRx State Management Guide (Complete Core Concepts)</strong></summary>

## 📚 Table of Contents

1. [What is NgRx?](#what-is-ngrx)
2. [Core Concepts Overview](#core-concepts-overview)
3. [Actions](#1-actions---events-that-describe-what-happened)
4. [Reducers](#2-reducers---pure-state-transitions)
5. [Store](#3-store---single-source-of-truth)
6. [Selectors](#4-selectors---querying-state-efficiently)
7. [Effects](#5-effects---handling-side-effects)
8. [Entity Adapter](#6-entity-adapter---managing-collections)
9. [Component Store](#7-component-store---local-state-management)
10. [Best Practices](#best-practices)
11. [Testing](#testing-ngrx)
12. [Playgrounds](#try-it-yourself)

---

## What is NgRx?

NgRx is a **reactive state management library** for Angular, inspired by Redux. It provides:

- **Predictable state** - State changes only through actions
- **Immutability** - Never mutate state, always create new objects
- **Single source of truth** - One store for all application state
- **DevTools** - Time-travel debugging, state inspection

### NgRx vs Java/Backend Patterns

| NgRx Concept | Java Equivalent | Purpose |
|--------------|-----------------|---------|
| **Store** | Database / Application Context | Single source of truth |
| **Action** | Domain Event / Command (CQRS) | Describes what happened |
| **Reducer** | Event Sourcing Handler | Updates state (pure function) |
| **Selector** | Repository Query / DTO Mapper | Reads/derives state |
| **Effect** | Application Service / @Async | Side effects (API calls) |
| **Entity Adapter** | JPA Repository | CRUD for collections |

---

## Core Concepts Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NgRx ARCHITECTURE                                  │
└─────────────────────────────────────────────────────────────────────────────┘

     ┌──────────────────────────────────────────────────────────────────┐
     │                         COMPONENT                                 │
     │  ┌─────────────────┐                    ┌─────────────────────┐  │
     │  │ store.dispatch( │                    │ store.select(       │  │
     │  │   action()      │                    │   selector)         │  │
     │  │ )               │                    │ | async             │  │
     │  └────────┬────────┘                    └──────────▲──────────┘  │
     └───────────┼───────────────────────────────────────┼─────────────┘
                 │                                        │
                 ▼                                        │
     ┌───────────────────────┐                           │
     │       ACTIONS         │                           │
     │  { type: '[Cart]...'  │                           │
     │    payload: {...} }   │                           │
     └───────────┬───────────┘                           │
                 │                                        │
        ┌────────┴────────┐                              │
        │                 │                              │
        ▼                 ▼                              │
┌───────────────┐  ┌─────────────────┐         ┌────────┴────────┐
│   REDUCERS    │  │     EFFECTS     │         │   SELECTORS     │
│ (pure funcs)  │  │ (side effects)  │         │  (memoized)     │
│               │  │                 │         │                 │
│ state + action│  │ action → API →  │         │ state → slice   │
│ = new state   │  │ new action      │         │ → derived data  │
└───────┬───────┘  └────────┬────────┘         └────────▲────────┘
        │                   │                           │
        │                   │ dispatch                  │
        ▼                   ▼                           │
     ┌──────────────────────────────────────────────────┴──┐
     │                       STORE                          │
     │  ┌─────────────────────────────────────────────────┐│
     │  │  {                                              ││
     │  │    products: { items: [], loading: false },     ││
     │  │    cart: { items: [], total: 0 },               ││
     │  │    user: { current: null, authenticated: false }││
     │  │  }                                              ││
     │  └─────────────────────────────────────────────────┘│
     └─────────────────────────────────────────────────────┘
```

---

## 1. ACTIONS - Events That Describe What Happened

Actions are **plain objects** that describe unique events in your application. Think of them as "news headlines" - they tell you WHAT happened, not HOW to handle it.

### Action Anatomy

```typescript
interface Action {
  type: string;      // Unique identifier, e.g., '[Cart] Add Item'
  payload?: any;     // Optional data
}
```

### Creating Actions

```typescript
import { createAction, props } from '@ngrx/store';

// Simple action (no payload)
export const loadProducts = createAction(
  '[Products Page] Load Products'
);

// Action with payload
export const addToCart = createAction(
  '[Product Card] Add To Cart',
  props<{ productId: number; quantity: number }>()
);

// Action with typed payload object
export const loadProductsSuccess = createAction(
  '[Products API] Load Success',
  props<{ products: Product[] }>()
);

export const loadProductsFailure = createAction(
  '[Products API] Load Failure',
  props<{ error: string }>()
);
```

### Action Naming Convention

```
[Source] Event Description

Source: Where the action originated
- [Products Page]     - User interaction on page
- [Products API]      - API response
- [Cart Effects]      - Side effect
- [Router]            - Navigation
- [App Init]          - Application startup

Examples:
- [Products Page] Load Products       ← User clicked "Load"
- [Products API] Load Success         ← API responded
- [Cart Page] Remove Item             ← User removed item
- [Auth Guard] Login Redirect         ← Guard triggered
```

### Good vs Bad Action Design

```typescript
// ❌ BAD - Too generic
createAction('LOAD');
createAction('UPDATE');

// ❌ BAD - Contains implementation details
createAction('SET_PRODUCTS_ARRAY');
createAction('PUSH_TO_CART');

// ✅ GOOD - Descriptive, sourced, event-based
createAction('[Products Page] Load Products');
createAction('[Cart API] Update Quantity Success');
```

---

## 2. REDUCERS - Pure State Transitions

Reducers are **pure functions** that take the current state and an action, and return a new state. They are the ONLY place where state changes.

### Reducer Rules (IMPORTANT!)

1. **Pure function** - Same input = Same output
2. **No side effects** - No API calls, no console.log, no random
3. **Immutable** - Never modify state, always return NEW objects
4. **Synchronous** - No async, no promises

### Basic Reducer

```typescript
import { createReducer, on } from '@ngrx/store';
import * as ProductActions from './products.actions';

// 1. Define state interface
export interface ProductsState {
  products: Product[];
  selectedProductId: number | null;
  loading: boolean;
  error: string | null;
}

// 2. Define initial state
export const initialState: ProductsState = {
  products: [],
  selectedProductId: null,
  loading: false,
  error: null,
};

// 3. Create reducer with action handlers
export const productsReducer = createReducer(
  initialState,

  // Loading state
  on(ProductActions.loadProducts, (state) => ({
    ...state,              // Spread existing state
    loading: true,         // Update specific property
    error: null,
  })),

  // Success - update products
  on(ProductActions.loadProductsSuccess, (state, { products }) => ({
    ...state,
    products,              // ES6 shorthand for products: products
    loading: false,
  })),

  // Failure - set error
  on(ProductActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Select product
  on(ProductActions.selectProduct, (state, { productId }) => ({
    ...state,
    selectedProductId: productId,
  }))
);
```

### Immutability Patterns

```typescript
// ❌ WRONG - Mutating state
on(addItem, (state, { item }) => {
  state.items.push(item);  // MUTATION!
  return state;
});

// ✅ CORRECT - New array
on(addItem, (state, { item }) => ({
  ...state,
  items: [...state.items, item]  // New array with item
}));

// ✅ Update item in array
on(updateItem, (state, { id, changes }) => ({
  ...state,
  items: state.items.map(item =>
    item.id === id ? { ...item, ...changes } : item
  )
}));

// ✅ Remove item from array
on(removeItem, (state, { id }) => ({
  ...state,
  items: state.items.filter(item => item.id !== id)
}));

// ✅ Update nested object
on(updateUserAddress, (state, { address }) => ({
  ...state,
  user: {
    ...state.user,
    address: {
      ...state.user.address,
      ...address
    }
  }
}));
```

---

## 3. STORE - Single Source of Truth

The Store is a **single, immutable state tree** containing all application state. Components read from the Store via selectors and update it via actions.

### Store Setup (Angular 17+ Standalone)

```typescript
// app.config.ts
import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { productsReducer } from './store/products/products.reducer';
import { cartReducer } from './store/cart/cart.reducer';
import { ProductsEffects } from './store/products/products.effects';
import { CartEffects } from './store/cart/cart.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    // Register root reducers
    provideStore({
      products: productsReducer,
      cart: cartReducer,
    }),

    // Register effects
    provideEffects([ProductsEffects, CartEffects]),

    // DevTools (development only)
    provideStoreDevtools({
      maxAge: 25,                // Keep last 25 states
      logOnly: !isDevMode(),    // Log only in production
      autoPause: true,          // Pause when DevTools closed
    }),
  ],
};
```

### Feature State (Lazy Loaded Modules)

```typescript
// products.routes.ts (lazy loaded)
import { provideState, provideEffects } from '@ngrx/store';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    component: ProductsComponent,
    providers: [
      provideState('products', productsReducer),
      provideEffects([ProductsEffects]),
    ],
  },
];
```

### Using Store in Components

```typescript
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf],
  template: `
    <div *ngIf="loading$ | async">Loading...</div>
    <div *ngIf="error$ | async as error" class="error">{{ error }}</div>

    <div *ngFor="let product of products$ | async">
      {{ product.name }} - {{ product.price | currency }}
      <button (click)="addToCart(product)">Add to Cart</button>
    </div>
  `,
})
export class ProductsComponent {
  private store = inject(Store);

  // Select state slices (returns Observable)
  products$ = this.store.select(selectAllProducts);
  loading$ = this.store.select(selectProductsLoading);
  error$ = this.store.select(selectProductsError);

  ngOnInit() {
    // Dispatch action to load products
    this.store.dispatch(loadProducts());
  }

  addToCart(product: Product) {
    this.store.dispatch(addToCart({
      productId: product.id,
      quantity: 1
    }));
  }
}
```

---

## 4. SELECTORS - Querying State Efficiently

Selectors are **pure functions** that extract and transform data from the store. They are **memoized** - they only recalculate when their inputs change.

### Why Use Selectors?

1. **Memoization** - Cached results, no unnecessary recalculations
2. **Composition** - Build complex selectors from simple ones
3. **Decoupling** - Components don't know state structure
4. **Testability** - Pure functions are easy to test
5. **Reusability** - Same selector across multiple components

### Creating Selectors

```typescript
import { createFeatureSelector, createSelector } from '@ngrx/store';

// 1. Feature selector - selects a slice of root state
export const selectProductsState =
  createFeatureSelector<ProductsState>('products');

// 2. Basic selectors - extract properties
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

// 3. Composed selectors - combine multiple selectors
export const selectSelectedProduct = createSelector(
  selectAllProducts,
  selectSelectedProductId,
  (products, selectedId) =>
    products.find(p => p.id === selectedId) ?? null
);

// 4. Derived data selectors
export const selectProductCount = createSelector(
  selectAllProducts,
  (products) => products.length
);

export const selectProductsInStock = createSelector(
  selectAllProducts,
  (products) => products.filter(p => p.stock > 0)
);

export const selectTotalInventoryValue = createSelector(
  selectAllProducts,
  (products) => products.reduce((sum, p) => sum + p.price * p.stock, 0)
);
```

### Parameterized Selectors (Factory Functions)

```typescript
// Selector that takes a parameter
export const selectProductById = (productId: number) =>
  createSelector(
    selectAllProducts,
    (products) => products.find(p => p.id === productId)
  );

// Usage in component
product$ = this.store.select(selectProductById(123));

// Selector with props (alternative)
export const selectProductsByCategory = (category: string) =>
  createSelector(
    selectAllProducts,
    (products) => products.filter(p => p.category === category)
  );
```

### Combining Selectors from Multiple Features

```typescript
// Cross-feature selector
export const selectCartWithProducts = createSelector(
  selectCartItems,       // From cart feature
  selectAllProducts,     // From products feature
  (cartItems, products) =>
    cartItems.map(item => ({
      ...item,
      product: products.find(p => p.id === item.productId)
    }))
);
```

### Selector Memoization Visualization

```
First call:
selectCartTotal(state)
  → selectCartItems(state)          ← COMPUTE
  → reduce to total                 ← COMPUTE
  → return 150                      ← CACHE

Second call (state unchanged):
selectCartTotal(state)
  → return 150                      ← CACHED! No computation

Third call (state changed):
selectCartTotal(newState)
  → selectCartItems(newState)       ← COMPUTE (state changed)
  → reduce to total                 ← COMPUTE
  → return 175                      ← CACHE
```

---

## 5. EFFECTS - Handling Side Effects

Effects handle **side effects** - operations that interact with the outside world: API calls, localStorage, routing, logging, etc.

### Effect Anatomy

```typescript
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';

@Injectable()
export class ProductsEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);

  // Effect that dispatches a new action
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProducts),                    // Filter for this action
      switchMap(() =>                          // Switch to HTTP observable
        this.http.get<Product[]>('/api/products').pipe(
          map(products => loadProductsSuccess({ products })),
          catchError(error =>
            of(loadProductsFailure({ error: error.message }))
          )
        )
      )
    )
  );

  // Effect that does NOT dispatch (side effect only)
  logActions$ = createEffect(
    () =>
      this.actions$.pipe(
        tap(action => console.log('Action:', action))
      ),
    { dispatch: false }  // ← Important!
  );
}
```

### Effect Flow Visualization

```
User clicks "Load Products" button
         │
         ▼
┌─────────────────────────────────────┐
│  store.dispatch(loadProducts())     │
└──────────────────┬──────────────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
    ▼                             ▼
┌────────────────┐       ┌────────────────────────────┐
│    REDUCER     │       │         EFFECT              │
│                │       │                             │
│ state.loading  │       │ ofType(loadProducts)       │
│   = true       │       │          │                 │
└────────────────┘       │          ▼                 │
                         │ switchMap(() =>            │
                         │   http.get('/api/products')│
                         │ )                          │
                         │          │                 │
                         │          ▼                 │
                         │ map(products =>            │
                         │   loadProductsSuccess()    │
                         │ )                          │
                         └────────────┬───────────────┘
                                      │
                                      ▼ dispatch
                         ┌────────────────────────────┐
                         │     REDUCER                 │
                         │                             │
                         │ on(loadProductsSuccess)     │
                         │   state.products = products │
                         │   state.loading = false     │
                         └────────────────────────────┘
```

### Effect Operator Selection Guide

| Scenario | Operator | Why |
|----------|----------|-----|
| **Search, Autocomplete, Navigation** | `switchMap` | Cancel previous, only latest matters |
| **Bulk fetch, Parallel downloads** | `mergeMap` | All requests run simultaneously |
| **Sequential saves, Transactions** | `concatMap` | Wait for each to complete |
| **Form submit, Payment** | `exhaustMap` | Ignore new while processing |

```typescript
// switchMap - Search (cancel old searches)
search$ = createEffect(() =>
  this.actions$.pipe(
    ofType(search),
    debounceTime(300),
    switchMap(({ term }) =>
      this.http.get(`/api/search?q=${term}`).pipe(
        map(results => searchSuccess({ results })),
        catchError(error => of(searchFailure({ error })))
      )
    )
  )
);

// exhaustMap - Form submit (ignore double-clicks)
submitOrder$ = createEffect(() =>
  this.actions$.pipe(
    ofType(submitOrder),
    exhaustMap(({ order }) =>
      this.http.post('/api/orders', order).pipe(
        map(response => submitOrderSuccess({ orderId: response.id })),
        catchError(error => of(submitOrderFailure({ error })))
      )
    )
  )
);

// concatMap - Sequential operations
saveItems$ = createEffect(() =>
  this.actions$.pipe(
    ofType(saveAllItems),
    concatMap(({ items }) =>
      from(items).pipe(
        concatMap(item => this.http.post('/api/items', item)),
        toArray(),
        map(() => saveAllItemsSuccess()),
        catchError(error => of(saveAllItemsFailure({ error })))
      )
    )
  )
);
```

### Common Effect Patterns

```typescript
// Pattern 1: Navigation after success
createOrder$ = createEffect(() =>
  this.actions$.pipe(
    ofType(createOrderSuccess),
    tap(({ orderId }) => this.router.navigate(['/orders', orderId]))
  ),
  { dispatch: false }
);

// Pattern 2: localStorage persistence
persistCart$ = createEffect(() =>
  this.actions$.pipe(
    ofType(addToCart, removeFromCart, clearCart),
    withLatestFrom(this.store.select(selectCartItems)),
    tap(([_, items]) => localStorage.setItem('cart', JSON.stringify(items)))
  ),
  { dispatch: false }
);

// Pattern 3: Show notification
showError$ = createEffect(() =>
  this.actions$.pipe(
    ofType(loadProductsFailure, saveOrderFailure),
    tap(({ error }) => this.snackbar.open(error, 'Dismiss'))
  ),
  { dispatch: false }
);
```

---

## 6. ENTITY ADAPTER - Managing Collections

Entity Adapter provides **CRUD operations** for normalized entity collections. It's like a mini-database for your state.

### Why Use Entity Adapter?

- **Normalized state** - Entities stored by ID in a dictionary
- **Fast lookups** - O(1) access by ID
- **Built-in CRUD** - Add, update, remove operations
- **Sorted collections** - Optional sorting

### Entity State Structure

```typescript
// What Entity Adapter creates
interface EntityState<T> {
  ids: string[] | number[];     // Array of IDs (maintains order)
  entities: { [id: string]: T }; // Dictionary for fast lookup
}

// Example state:
{
  ids: [1, 2, 3],
  entities: {
    1: { id: 1, name: 'Product A', price: 10 },
    2: { id: 2, name: 'Product B', price: 20 },
    3: { id: 3, name: 'Product C', price: 30 },
  }
}
```

### Setting Up Entity Adapter

```typescript
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

// 1. Define entity
export interface Product {
  id: number;
  name: string;
  price: number;
}

// 2. Extend EntityState for your state
export interface ProductsState extends EntityState<Product> {
  selectedProductId: number | null;
  loading: boolean;
  error: string | null;
}

// 3. Create adapter
export const productsAdapter: EntityAdapter<Product> = createEntityAdapter<Product>({
  selectId: (product) => product.id,     // How to get ID
  sortComparer: (a, b) => a.name.localeCompare(b.name), // Optional sorting
});

// 4. Create initial state
export const initialState: ProductsState = productsAdapter.getInitialState({
  selectedProductId: null,
  loading: false,
  error: null,
});
```

### Entity Adapter Operations

```typescript
export const productsReducer = createReducer(
  initialState,

  // Add one entity
  on(addProduct, (state, { product }) =>
    productsAdapter.addOne(product, state)
  ),

  // Add many entities
  on(loadProductsSuccess, (state, { products }) =>
    productsAdapter.setAll(products, { ...state, loading: false })
  ),

  // Update one entity
  on(updateProduct, (state, { update }) =>
    productsAdapter.updateOne(update, state)
    // update = { id: 1, changes: { price: 25 } }
  ),

  // Update many entities
  on(updateProducts, (state, { updates }) =>
    productsAdapter.updateMany(updates, state)
  ),

  // Upsert (add or update)
  on(upsertProduct, (state, { product }) =>
    productsAdapter.upsertOne(product, state)
  ),

  // Remove one
  on(removeProduct, (state, { id }) =>
    productsAdapter.removeOne(id, state)
  ),

  // Remove many
  on(removeProducts, (state, { ids }) =>
    productsAdapter.removeMany(ids, state)
  ),

  // Remove all
  on(clearProducts, (state) =>
    productsAdapter.removeAll(state)
  )
);
```

### Entity Selectors

```typescript
// Get built-in selectors from adapter
const {
  selectIds,      // Select array of IDs
  selectEntities, // Select entity dictionary
  selectAll,      // Select array of all entities
  selectTotal,    // Select count of entities
} = productsAdapter.getSelectors();

// Use with feature selector
export const selectProductsState =
  createFeatureSelector<ProductsState>('products');

export const selectAllProducts = createSelector(
  selectProductsState,
  selectAll
);

export const selectProductIds = createSelector(
  selectProductsState,
  selectIds
);

export const selectProductEntities = createSelector(
  selectProductsState,
  selectEntities
);

export const selectProductCount = createSelector(
  selectProductsState,
  selectTotal
);

// Select by ID (using entities dictionary)
export const selectProductById = (id: number) =>
  createSelector(
    selectProductEntities,
    (entities) => entities[id]
  );
```

---

## 7. COMPONENT STORE - Local State Management

ComponentStore is for **local/component-level state** - simpler than global store, perfect for complex components.

### When to Use ComponentStore vs Store

```
┌─────────────────────────────────────────────────────────────────┐
│                     USE COMPONENT STORE WHEN:                    │
├─────────────────────────────────────────────────────────────────┤
│  ✓ State is local to one component or feature                   │
│  ✓ State doesn't need to persist across routes                  │
│  ✓ Multiple instances need independent state                    │
│  ✓ You want simpler, less boilerplate                           │
├─────────────────────────────────────────────────────────────────┤
│                     USE GLOBAL STORE WHEN:                       │
├─────────────────────────────────────────────────────────────────┤
│  ✓ State is shared across many components                       │
│  ✓ State needs to survive navigation                            │
│  ✓ You need time-travel debugging                               │
│  ✓ Team needs enforced patterns                                 │
└─────────────────────────────────────────────────────────────────┘
```

### ComponentStore Example

```typescript
import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';

interface ProductListState {
  products: Product[];
  loading: boolean;
  error: string | null;
  filter: string;
}

@Injectable()
export class ProductListStore extends ComponentStore<ProductListState> {
  constructor(private http: HttpClient) {
    super({
      products: [],
      loading: false,
      error: null,
      filter: '',
    });
  }

  // Selectors
  readonly products$ = this.select(state => state.products);
  readonly loading$ = this.select(state => state.loading);
  readonly filter$ = this.select(state => state.filter);

  // Derived selector
  readonly filteredProducts$ = this.select(
    this.products$,
    this.filter$,
    (products, filter) =>
      products.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase())
      )
  );

  // Updaters (like reducers)
  readonly setFilter = this.updater((state, filter: string) => ({
    ...state,
    filter,
  }));

  readonly setProducts = this.updater((state, products: Product[]) => ({
    ...state,
    products,
    loading: false,
  }));

  // Effects
  readonly loadProducts = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      tap(() => this.patchState({ loading: true, error: null })),
      switchMap(() =>
        this.http.get<Product[]>('/api/products').pipe(
          tap(products => this.setProducts(products)),
          catchError(error => {
            this.patchState({ loading: false, error: error.message });
            return EMPTY;
          })
        )
      )
    )
  );
}

// Usage in component
@Component({
  providers: [ProductListStore],  // Each component gets its own instance
})
export class ProductListComponent {
  store = inject(ProductListStore);

  products$ = this.store.filteredProducts$;
  loading$ = this.store.loading$;

  ngOnInit() {
    this.store.loadProducts();
  }

  onFilterChange(filter: string) {
    this.store.setFilter(filter);
  }
}
```

---

## Best Practices

### 1. State Structure

```typescript
// ✅ GOOD - Normalized, flat state
interface AppState {
  products: {
    ids: number[];
    entities: { [id: number]: Product };
    loading: boolean;
  };
  cart: {
    items: { productId: number; quantity: number }[];
  };
}

// ❌ BAD - Nested, denormalized
interface AppState {
  cart: {
    items: {
      product: {
        category: {
          // Deep nesting!
        };
      };
    }[];
  };
}
```

### 2. Action Hygiene

```typescript
// ✅ GOOD - One action = one event
loadProducts()
loadProductsSuccess({ products })
loadProductsFailure({ error })

// ❌ BAD - Generic "setter" actions
setProducts({ products })
setLoading({ loading })
setError({ error })
```

### 3. Selector Composition

```typescript
// ✅ GOOD - Small, composable selectors
const selectItems = createSelector(selectCart, cart => cart.items);
const selectPrices = createSelector(selectItems, items => items.map(i => i.price));
const selectTotal = createSelector(selectPrices, prices => prices.reduce((a, b) => a + b, 0));

// ❌ BAD - One giant selector
const selectEverything = createSelector(
  selectState,
  state => {
    // 50 lines of logic...
  }
);
```

### 4. Effect Error Handling

```typescript
// ✅ GOOD - catchError inside switchMap
loadProducts$ = createEffect(() =>
  this.actions$.pipe(
    ofType(loadProducts),
    switchMap(() =>
      this.http.get('/api/products').pipe(
        map(products => loadProductsSuccess({ products })),
        catchError(error => of(loadProductsFailure({ error })))  // ← Inside!
      )
    )
  )
);

// ❌ BAD - catchError outside (kills the effect!)
loadProducts$ = createEffect(() =>
  this.actions$.pipe(
    ofType(loadProducts),
    switchMap(() => this.http.get('/api/products')),
    map(products => loadProductsSuccess({ products })),
    catchError(error => of(loadProductsFailure({ error })))  // ← Outside = broken!
  )
);
```

---

## Testing NgRx

### Testing Reducers

```typescript
describe('Products Reducer', () => {
  it('should set loading true on loadProducts', () => {
    const action = loadProducts();
    const result = productsReducer(initialState, action);

    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('should set products on loadProductsSuccess', () => {
    const products = [{ id: 1, name: 'Test', price: 10 }];
    const action = loadProductsSuccess({ products });
    const result = productsReducer(
      { ...initialState, loading: true },
      action
    );

    expect(result.products).toEqual(products);
    expect(result.loading).toBe(false);
  });
});
```

### Testing Selectors

```typescript
describe('Products Selectors', () => {
  const state: ProductsState = {
    products: [
      { id: 1, name: 'A', price: 10 },
      { id: 2, name: 'B', price: 20 },
    ],
    loading: false,
    error: null,
  };

  it('should select all products', () => {
    const result = selectAllProducts.projector(state);
    expect(result.length).toBe(2);
  });

  it('should calculate total', () => {
    const result = selectProductsTotal.projector(state.products);
    expect(result).toBe(30);
  });
});
```

### Testing Effects

```typescript
describe('Products Effects', () => {
  let effects: ProductsEffects;
  let actions$: Observable<Action>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProductsEffects,
        provideMockActions(() => actions$),
      ],
    });

    effects = TestBed.inject(ProductsEffects);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should load products successfully', () => {
    const products = [{ id: 1, name: 'Test', price: 10 }];
    actions$ = of(loadProducts());

    effects.loadProducts$.subscribe(action => {
      expect(action).toEqual(loadProductsSuccess({ products }));
    });

    const req = httpMock.expectOne('/api/products');
    req.flush(products);
  });
});
```

---

## Try It Yourself!

### Interactive Playgrounds

| Route | Description |
|-------|-------------|
| `/ngrx-playground` | **Simulated NgRx** - Learn concepts with plain RxJS (no packages) |
| `/ngrx-real-playground` | **Real NgRx Store** - See actual @ngrx/store in action |

### Project Files

```
src/app/store/
├── app.state.ts           # Root state interface
├── products/
│   ├── products.actions.ts
│   ├── products.reducer.ts
│   ├── products.selectors.ts
│   ├── products.effects.ts
│   └── index.ts
├── cart/
│   ├── cart.actions.ts
│   ├── cart.reducer.ts
│   ├── cart.selectors.ts
│   ├── cart.effects.ts
│   └── index.ts
└── index.ts               # Barrel export
```

---

### Readiness Self-Check

<details>
<summary><strong>Quiz 1: What's the difference between Action and Effect?</strong></summary>

**Answer:**
- **Action**: A plain object describing WHAT happened (event)
- **Effect**: A service that REACTS to actions and performs side effects (API calls)

Actions are dispatched → Effects listen → Effects dispatch new actions

</details>

<details>
<summary><strong>Quiz 2: Why must reducers be pure functions?</strong></summary>

**Answer:**
- Predictable state changes (same input = same output)
- Enable time-travel debugging
- Easy to test
- No side effects = no unexpected behavior

```typescript
// WRONG - mutates state
on(action, (state) => { state.items.push(item); return state; })

// CORRECT - returns new state
on(action, (state) => ({ ...state, items: [...state.items, item] }))
```

</details>

<details>
<summary><strong>Quiz 3: When to use switchMap vs exhaustMap in effects?</strong></summary>

**Answer:**
- **switchMap**: User can trigger multiple times, only latest matters (search, navigation)
- **exhaustMap**: Ignore new triggers until current completes (form submit, payment)

```typescript
// Search - cancel old, use latest
switchMap(() => this.http.get('/search'))

// Submit - ignore clicks while processing
exhaustMap(() => this.http.post('/order'))
```

</details>

<details>
<summary><strong>Quiz 4: Why use selectors instead of accessing store directly?</strong></summary>

**Answer:**
- **Memoization**: Only recalculates when inputs change
- **Composition**: Build complex queries from simple ones
- **Decoupling**: Components don't know state shape
- **Testing**: Pure functions are easy to test

</details>

<details>
<summary><strong>Quiz 5: Store vs BehaviorSubject - when to use which?</strong></summary>

**Answer:**
- **BehaviorSubject**: Simple shared state, few components, no complex interactions
- **NgRx Store**: Many components, complex state logic, need debugging tools, team patterns

Rule of thumb: Start simple, add NgRx when complexity grows.

</details>

<details>
<summary><strong>Quiz 6: What is Entity Adapter and when to use it?</strong></summary>

**Answer:**
Entity Adapter manages collections of entities (like products, users) with:
- Normalized state (dictionary by ID)
- Built-in CRUD operations (addOne, updateOne, removeOne)
- Fast O(1) lookups by ID
- Automatic sorting

Use when you have a list of items with unique IDs that you need to add/update/remove.

</details>

<details>
<summary><strong>Quiz 7: What's wrong with this effect?</strong></summary>

```typescript
loadProducts$ = createEffect(() =>
  this.actions$.pipe(
    ofType(loadProducts),
    switchMap(() => this.http.get('/api/products')),
    map(products => loadProductsSuccess({ products })),
    catchError(error => of(loadProductsFailure({ error })))
  )
);
```

**Answer:** The `catchError` is OUTSIDE the `switchMap`. If an error occurs, the effect stream dies and won't respond to future actions.

**Fix:** Move `catchError` INSIDE `switchMap`:

```typescript
switchMap(() =>
  this.http.get('/api/products').pipe(
    map(products => loadProductsSuccess({ products })),
    catchError(error => of(loadProductsFailure({ error })))  // ← Inside!
  )
)
```

</details>

**See full examples:** `src/app/examples/ngrx-examples.ts`

</details>

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
