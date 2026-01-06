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
