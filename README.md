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
<summary><strong>NgRx State Management Guide (for Java Developers)</strong></summary>

### NgRx vs Java/Backend Patterns

| NgRx Concept | Java Equivalent | Purpose |
|--------------|-----------------|---------|
| **Store** | Database / Application State | Single source of truth |
| **Action** | Domain Event / Command | Describes what happened |
| **Reducer** | Event Handler | Updates state (pure function) |
| **Selector** | Repository Query / DTO | Reads/derives state |
| **Effect** | Application Service | Side effects (API calls) |

### Data Flow (Unidirectional)

```
Component ──dispatch──► Action ──► Reducer ──► Store ──► Selector ──► Component
                           │
                           └──► Effect ──► API ──► Action
```

---

### Actions - Describing What Happened

```typescript
// Naming: [Source] Event Description
export const loadProducts = createAction('[Products Page] Load Products');

export const loadProductsSuccess = createAction(
  '[Products API] Load Products Success',
  props<{ products: Product[] }>()
);

export const loadProductsFailure = createAction(
  '[Products API] Load Products Failure',
  props<{ error: string }>()
);
```

---

### Reducers - Pure State Updates

```typescript
export const productsReducer = createReducer(
  initialState,

  on(loadProducts, (state) => ({
    ...state,           // Always spread - never mutate!
    loading: true
  })),

  on(loadProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    loading: false
  })),

  on(loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
```

---

### Selectors - Efficient State Queries

```typescript
// Feature selector
export const selectProductsState = createFeatureSelector<ProductsState>('products');

// Simple selectors
export const selectAllProducts = createSelector(
  selectProductsState,
  (state) => state.products
);

// Composed/derived selectors (memoized!)
export const selectCartTotal = createSelector(
  selectCartSubtotal,
  selectCartTax,
  (subtotal, tax) => subtotal + tax
);

// Parameterized selector
export const selectProductById = (id: number) => createSelector(
  selectAllProducts,
  (products) => products.find(p => p.id === id)
);
```

---

### Effects - Side Effects (API Calls)

```typescript
@Injectable()
export class ProductsEffects {

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProducts),                    // Listen for action
      switchMap(() =>                          // Cancel previous
        this.http.get<Product[]>('/api/products').pipe(
          map(products => loadProductsSuccess({ products })),
          catchError(err => of(loadProductsFailure({ error: err.message })))
        )
      )
    )
  );

  // Effect without dispatch (side effect only)
  logError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProductsFailure),
      tap(({ error }) => console.error('Failed:', error))
    ),
    { dispatch: false }
  );
}
```

---

### Using in Components

```typescript
@Component({...})
export class ProductListComponent {
  // Select state (returns Observable)
  products$ = this.store.select(selectAllProducts);
  loading$ = this.store.select(selectProductsLoading);

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(loadProducts());  // Dispatch action
  }

  addToCart(product: Product) {
    this.store.dispatch(addToCart({ product, quantity: 1 }));
  }
}
```

```html
<!-- Template with async pipe -->
<div *ngIf="loading$ | async">Loading...</div>

<div *ngFor="let product of products$ | async">
  {{ product.name }}
  <button (click)="addToCart(product)">Add</button>
</div>
```

---

### Effect Operator Guide

| Scenario | Operator | Why |
|----------|----------|-----|
| Search/Navigation | `switchMap` | Cancel previous request |
| Bulk operations | `mergeMap` | Run all in parallel |
| Sequential saves | `concatMap` | Maintain order |
| Form submit | `exhaustMap` | Ignore while processing |

---

### When to Use NgRx vs Simpler Options

```
┌─────────────────────────────────────────────────────────────────┐
│                     USE NGRX WHEN:                              │
├─────────────────────────────────────────────────────────────────┤
│  ✓ Shared state between many unrelated components              │
│  ✓ Complex state with many user interactions                   │
│  ✓ Need undo/redo or time-travel debugging                     │
│  ✓ Team needs enforced patterns                                │
│  ✓ State needs to survive route changes                        │
├─────────────────────────────────────────────────────────────────┤
│                     USE SIMPLER OPTIONS:                        │
├─────────────────────────────────────────────────────────────────┤
│  • Simple services with BehaviorSubject                        │
│  • Component-local state → ComponentStore                       │
│  • Server cache → TanStack Query or simple HTTP cache          │
└─────────────────────────────────────────────────────────────────┘
```

---

### Quick Setup

```bash
# Install NgRx packages
ng add @ngrx/store
ng add @ngrx/effects
ng add @ngrx/store-devtools
ng add @ngrx/entity        # Optional: for collections
ng add @ngrx/component-store  # Optional: for local state
```

```typescript
// app.config.ts or app.module.ts
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

export const appConfig = {
  providers: [
    provideStore({ products: productsReducer, cart: cartReducer }),
    provideEffects([ProductsEffects, CartEffects])
  ]
};
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
