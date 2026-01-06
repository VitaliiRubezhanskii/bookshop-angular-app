/**
 * RxJS Learning Examples for Java Developers
 *
 * Think of Observable as Java's Flux/Mono or RxJava Observable
 * pipe() is like method chaining in Java Streams
 */

import { Observable, of, from, forkJoin, combineLatest, Subject, BehaviorSubject } from 'rxjs';
import { map, filter, tap, switchMap, mergeMap, concatMap, exhaustMap, catchError, take, debounceTime, distinctUntilChanged, retry, toArray } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

// ============================================================
// LEVEL 1: BASIC OPERATORS (map, filter, tap)
// ============================================================

/**
 * MAP - Transform each emitted value
 *
 * Java equivalent:
 *   stream.map(product -> product.getName())
 *   Flux.map(product -> product.getName())
 */
export class Level1_Map {

  constructor(private http: HttpClient) {}

  // Example 1: Extract specific field
  getProductNames(): Observable<string[]> {
    return this.http.get<Product[]>('/api/products').pipe(
      map(products => products.map(p => p.name))
      //   ^^^                 ^^^
      //   RxJS map            Array.map (same as Java stream.map)
    );
  }

  // Example 2: Transform response structure
  getProductsWithDiscount(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products').pipe(
      map(products => products.map(p => ({
        ...p,
        discountedPrice: p.unitPrice * 0.9  // 10% off
      })))
    );
  }
}

/**
 * FILTER - Keep only values matching predicate
 *
 * Java equivalent:
 *   stream.filter(product -> product.getPrice() > 10)
 */
export class Level1_Filter {

  constructor(private http: HttpClient) {}

  // Filter at Observable level (filter emissions)
  getExpensiveProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products').pipe(
      map(products => products.filter(p => p.unitPrice > 20))
      //                       ^^^^^^
      //                       This is Array.filter inside map
    );
  }
}

/**
 * TAP - Side effects without modifying the stream (for debugging/logging)
 *
 * Java equivalent:
 *   Flux.doOnNext(product -> log.info("Got: " + product))
 *   stream.peek(product -> System.out.println(product))
 */
export class Level1_Tap {

  constructor(private http: HttpClient) {}

  getProductsWithLogging(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products').pipe(
      tap(products => console.log('Raw response:', products)),  // Debug: see raw data
      map(products => products.filter(p => p.active)),
      tap(filtered => console.log('After filter:', filtered.length)), // Debug: see count
      map(products => products.slice(0, 10)),
      tap(final => console.log('Final result:', final))  // Debug: see final
    );
  }
}


// ============================================================
// LEVEL 2: FLATTENING OPERATORS (switchMap, mergeMap, concatMap)
// These are for "Observable of Observable" situations
// ============================================================

/**
 * SWITCHMAP - Cancel previous request when new one arrives
 *
 * USE CASE: Search-as-you-type (cancel old search when user types more)
 *
 * Java equivalent: flatMap but with cancellation
 *   Flux.switchMap(keyword -> searchService.search(keyword))
 */
export class Level2_SwitchMap {

  constructor(private http: HttpClient) {}

  // When category changes, fetch new products (cancel any pending request)
  getProductsByCategory(categoryId$: Observable<number>): Observable<Product[]> {
    return categoryId$.pipe(
      tap(id => console.log('Category changed to:', id)),
      switchMap(categoryId =>
        // This HTTP call will be CANCELLED if categoryId$ emits again
        this.http.get<Product[]>(`/api/products?category=${categoryId}`)
      )
    );
  }

  // Real-world: Search as you type
  searchProducts(searchTerm$: Observable<string>): Observable<Product[]> {
    return searchTerm$.pipe(
      debounceTime(300),           // Wait 300ms after last keystroke
      distinctUntilChanged(),       // Only if value changed
      tap(term => console.log('Searching for:', term)),
      switchMap(term =>
        // Previous search cancelled automatically!
        this.http.get<Product[]>(`/api/products/search?q=${term}`)
      )
    );
  }
}

/**
 * MERGEMAP (flatMap) - Run all requests in parallel, no cancellation
 *
 * USE CASE: Fetch details for multiple items simultaneously
 *
 * Java equivalent:
 *   Flux.flatMap(id -> getProduct(id))
 */
export class Level2_MergeMap {

  constructor(private http: HttpClient) {}

  // Fetch details for multiple products in parallel
  getMultipleProductDetails(productIds: number[]): Observable<Product> {
    return from(productIds).pipe(  // from([1,2,3]) emits 1, then 2, then 3
      mergeMap(id =>
        // All requests fire in parallel!
        this.http.get<Product>(`/api/products/${id}`)
      )
    );
  }
}

/**
 * CONCATMAP - Run requests sequentially, wait for each to complete
 *
 * USE CASE: Order-dependent operations (create parent, then children)
 *
 * Java equivalent:
 *   Flux.concatMap(item -> saveItem(item))  // one at a time
 */
export class Level2_ConcatMap {

  constructor(private http: HttpClient) {}

  // Save items one by one (order matters)
  saveItemsSequentially(items: CartItem[]): Observable<CartItem> {
    return from(items).pipe(
      concatMap(item =>
        // Wait for each save to complete before starting next
        this.http.post<CartItem>('/api/cart', item)
      )
    );
  }
}


// ============================================================
// LEVEL 3: COMBINATION OPERATORS (forkJoin, combineLatest)
// ============================================================

/**
 * FORKJOIN - Wait for all observables to complete, get all results
 *
 * Java equivalent:
 *   Mono.zip(mono1, mono2, mono3)
 *   CompletableFuture.allOf(...)
 */
export class Level3_ForkJoin {

  constructor(private http: HttpClient) {}

  // Load multiple resources in parallel, wait for all
  loadDashboardData(): Observable<DashboardData> {
    return forkJoin({
      products: this.http.get<Product[]>('/api/products'),
      categories: this.http.get<Category[]>('/api/categories'),
      user: this.http.get<User>('/api/user/me')
    }).pipe(
      map(({ products, categories, user }) => ({
        products,
        categories,
        userName: user.name,
        totalProducts: products.length
      }))
    );
  }
}

/**
 * COMBINELATEST - Emit whenever ANY source emits (with latest from others)
 *
 * USE CASE: Combine filters (category + search + sort)
 *
 * Java equivalent:
 *   Flux.combineLatest(flux1, flux2, (a, b) -> combine(a, b))
 */
export class Level3_CombineLatest {

  // Reactive filtering: re-filter when any filter changes
  getFilteredProducts(
    category$: Observable<string>,
    searchTerm$: Observable<string>,
    sortBy$: Observable<string>
  ): Observable<FilterParams> {
    return combineLatest([category$, searchTerm$, sortBy$]).pipe(
      tap(([cat, search, sort]) =>
        console.log(`Filters: ${cat}, ${search}, ${sort}`)
      ),
      map(([category, searchTerm, sortBy]) => ({
        category,
        searchTerm,
        sortBy
      }))
    );
  }
}


// ============================================================
// LEVEL 4: ERROR HANDLING
// ============================================================

/**
 * CATCHERROR - Handle errors gracefully
 *
 * Java equivalent:
 *   Flux.onErrorResume(e -> Flux.just(fallback))
 *   Mono.onErrorReturn(fallback)
 */
export class Level4_ErrorHandling {

  constructor(private http: HttpClient) {}

  // Return empty array on error
  getProductsSafe(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products').pipe(
      catchError(error => {
        console.error('Failed to fetch products:', error);
        return of([]);  // Return empty array as fallback
      })
    );
  }

  // Retry failed requests
  getProductsWithRetry(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products').pipe(
      retry(3),  // Retry up to 3 times on failure
      catchError(error => {
        console.error('Failed after 3 retries:', error);
        return of([]);
      })
    );
  }
}


// ============================================================
// LEVEL 5: EXHAUSTMAP - Ignore new until current completes
// ============================================================

/**
 * EXHAUSTMAP - Ignore new emissions while current Observable is still running
 *
 * USE CASE: Prevent double-submit on button click
 *
 * Visual:
 *   click1 → HTTP ─────────────────→ done ✓
 *   click2 → (ignored, request in progress)
 *   click3 → (ignored)
 *   click4 → (ignored)
 *                                     click5 → HTTP → done ✓
 *                                     ↑
 *                              Only accepted after previous completes
 *
 * Java equivalent:
 *   No direct equivalent - custom implementation needed
 */
export class Level5_ExhaustMap {

  submitOrder$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  // Prevent double-submit: ignore clicks while request is in progress
  setupOrderSubmission(): Observable<OrderConfirmation> {
    return this.submitOrder$.pipe(
      exhaustMap(() =>
        // New clicks ignored until this completes!
        this.http.post<OrderConfirmation>('/api/orders', {})
      )
    );
  }

  // Call this from button click
  onSubmitClick(): void {
    this.submitOrder$.next();  // Rapid clicks are safely ignored
  }
}


// ============================================================
// LEVEL 6: REAL-WORLD PATTERNS
// ============================================================

/**
 * Real-world examples combining multiple operators
 */
export class Level6_RealWorldPatterns {

  constructor(private http: HttpClient) {}

  /**
   * Pattern 1: Search with loading state
   */
  searchWithLoadingState(searchTerm$: Observable<string>): Observable<SearchResult> {
    return searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term.trim()) {
          return of({ loading: false, products: [], error: null });
        }
        return this.http.get<Product[]>(`/api/search?q=${term}`).pipe(
          map(products => ({ loading: false, products, error: null })),
          catchError(error => of({ loading: false, products: [], error: error.message }))
        );
      })
    );
  }

  /**
   * Pattern 2: Load cart with product details (mergeMap + toArray)
   */
  loadCartWithDetails(cartItemIds: number[]): Observable<Product[]> {
    return from(cartItemIds).pipe(
      mergeMap(id => this.http.get<Product>(`/api/products/${id}`)),
      toArray()  // Collect all results into single array emission
    );
  }

  /**
   * Pattern 3: Sequential order placement (concatMap chain)
   */
  placeOrderSequentially(order: Order): Observable<OrderConfirmation> {
    return this.http.post<SavedOrder>('/api/orders', order).pipe(
      tap(saved => console.log('Order created:', saved.id)),
      concatMap(savedOrder =>
        // After order saved, save each item sequentially
        from(order.items).pipe(
          concatMap(item =>
            this.http.post(`/api/orders/${savedOrder.id}/items`, item)
          ),
          toArray(),
          map(() => savedOrder)
        )
      ),
      concatMap(savedOrder =>
        // After items saved, process payment
        this.http.post<PaymentResult>('/api/payments', {
          orderId: savedOrder.id,
          amount: order.total
        }).pipe(
          map(payment => ({
            orderId: savedOrder.id,
            paymentId: payment.id,
            status: 'confirmed'
          }))
        )
      )
    );
  }

  /**
   * Pattern 4: Dashboard with multiple data sources (forkJoin)
   */
  loadDashboard(userId: string): Observable<Dashboard> {
    return forkJoin({
      products: this.http.get<Product[]>('/api/products').pipe(
        catchError(() => of([]))  // Fallback to empty array
      ),
      categories: this.http.get<Category[]>('/api/categories').pipe(
        catchError(() => of([]))
      ),
      user: this.http.get<User>(`/api/users/${userId}`),
      recentOrders: this.http.get<Order[]>(`/api/users/${userId}/orders?limit=5`).pipe(
        catchError(() => of([]))
      )
    }).pipe(
      map(({ products, categories, user, recentOrders }) => ({
        products,
        categories,
        userName: user.name,
        totalProducts: products.length,
        recentOrders
      }))
    );
  }

  /**
   * Pattern 5: Reactive filters with combineLatest
   */
  setupReactiveFilters(
    category$: BehaviorSubject<string>,
    priceRange$: BehaviorSubject<PriceRange>,
    sortBy$: BehaviorSubject<string>
  ): Observable<Product[]> {
    return combineLatest([category$, priceRange$, sortBy$]).pipe(
      debounceTime(100),  // Small debounce to batch rapid changes
      tap(([cat, price, sort]) =>
        console.log(`Filters changed: ${cat}, ${price.min}-${price.max}, ${sort}`)
      ),
      switchMap(([category, priceRange, sortBy]) =>
        this.http.get<Product[]>('/api/products', {
          params: {
            category,
            minPrice: priceRange.min.toString(),
            maxPrice: priceRange.max.toString(),
            sortBy
          }
        })
      ),
      catchError(error => {
        console.error('Filter search failed:', error);
        return of([]);
      })
    );
  }
}


// ============================================================
// SUMMARY: When to use what?
// ============================================================
/*

| Operator      | Use When                                        | Cancels Previous? |
|---------------|------------------------------------------------|-------------------|
| map           | Transform data                                  | N/A               |
| filter        | Keep/remove emissions                           | N/A               |
| tap           | Debug/logging/side effects                      | N/A               |
| switchMap     | Only care about LATEST (search, route change)   | YES               |
| mergeMap      | All results matter, parallel OK                 | NO                |
| concatMap     | Order matters, sequential                       | NO                |
| exhaustMap    | Ignore new until current completes              | NO (ignores)      |
| forkJoin      | Wait for ALL to complete                        | N/A               |
| combineLatest | React to ANY change                             | N/A               |
| catchError    | Handle errors                                   | N/A               |

GOLDEN RULE for HTTP:
- User typing/searching → switchMap (cancel stale requests)
- Fetch multiple items in parallel → mergeMap
- Save items in order → concatMap (sequential, order matters)
- Load page data (wait for all) → forkJoin (parallel, wait)
- Multiple filters/inputs → combineLatest (react to any)
- Prevent double-submit → exhaustMap (ignore spam)

┌─────────────────────────────────────────────────────────────────┐
│                     WHICH OPERATOR TO USE?                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User typing/searching?          → switchMap (cancel stale)     │
│                                                                  │
│  Fetch multiple items parallel?  → mergeMap (all at once)       │
│                                                                  │
│  Save items in order?            → concatMap (one by one)       │
│                                                                  │
│  Load page data (wait for all)?  → forkJoin (parallel, wait)    │
│                                                                  │
│  Multiple filters/inputs?        → combineLatest (react to any) │
│                                                                  │
│  Prevent double-submit?          → exhaustMap (ignore spam)     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

*/


// Type definitions for examples
interface Product {
  id: number;
  name: string;
  unitPrice: number;
  categoryId: number;
  active: boolean;
}

interface CartItem {
  productId: number;
  quantity: number;
}

interface Category {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface DashboardData {
  products: Product[];
  categories: Category[];
  userName: string;
  totalProducts: number;
}

interface Dashboard extends DashboardData {
  recentOrders: Order[];
}

interface FilterParams {
  category: string;
  searchTerm: string;
  sortBy: string;
}

interface Order {
  id?: number;
  items: OrderItem[];
  total: number;
}

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

interface SavedOrder {
  id: number;
}

interface OrderConfirmation {
  orderId: number;
  paymentId: string;
  status: string;
}

interface PaymentResult {
  id: string;
  status: string;
}

interface SearchResult {
  loading: boolean;
  products: Product[];
  error: string | null;
}

interface PriceRange {
  min: number;
  max: number;
}
