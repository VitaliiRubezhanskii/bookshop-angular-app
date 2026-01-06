/**
 * RxJS Learning Examples for Java Developers
 *
 * Think of Observable as Java's Flux/Mono or RxJava Observable
 * pipe() is like method chaining in Java Streams
 */

import { Observable, of, from, forkJoin, combineLatest, Subject, BehaviorSubject, ReplaySubject, AsyncSubject, interval, timer, throwError } from 'rxjs';
import { map, filter, tap, switchMap, mergeMap, concatMap, exhaustMap, catchError, take, takeUntil, takeWhile, debounceTime, throttleTime, distinctUntilChanged, distinctUntilKeyChanged, retry, retryWhen, toArray, scan, reduce, startWith, pairwise, shareReplay, share, finalize, timeout, withLatestFrom, first, last, skip, skipUntil, delay } from 'rxjs/operators';
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
// LEVEL 7: SUBJECTS (Hot Observables)
// ============================================================

/**
 * SUBJECTS - Both Observable and Observer
 *
 * Subjects are "hot" - they emit regardless of subscribers
 * Unlike regular Observables which are "cold" - they start fresh for each subscriber
 *
 * Java equivalent:
 *   PublishSubject (RxJava), Sinks.many() (Reactor)
 */
export class Level7_Subjects {

  /**
   * SUBJECT - No initial value, no replay
   * Subscribers only get values emitted AFTER they subscribe
   */
  subjectExample() {
    const subject = new Subject<number>();

    subject.next(1);  // Lost! No subscribers yet

    subject.subscribe(val => console.log('Subscriber A:', val));

    subject.next(2);  // A gets this
    subject.next(3);  // A gets this

    subject.subscribe(val => console.log('Subscriber B:', val));

    subject.next(4);  // Both A and B get this
  }

  /**
   * BEHAVIORSUBJECT - Has initial value, new subscribers get current value immediately
   *
   * USE CASE: State management (current user, current filters, etc.)
   *
   * Java equivalent: BehaviorProcessor (RxJava)
   */
  behaviorSubjectExample() {
    const currentUser$ = new BehaviorSubject<string>('guest');  // Initial value required

    // New subscriber immediately gets 'guest'
    currentUser$.subscribe(user => console.log('Current user:', user));

    currentUser$.next('john');  // Subscriber gets 'john'

    // Late subscriber immediately gets 'john' (current value)
    currentUser$.subscribe(user => console.log('Late subscriber:', user));

    // Get current value synchronously (without subscribing)
    console.log('Sync value:', currentUser$.getValue());
  }

  /**
   * REPLAYSUBJECT - Replay N last values to new subscribers
   *
   * USE CASE: Cache last N events, chat history
   */
  replaySubjectExample() {
    const messages$ = new ReplaySubject<string>(3);  // Replay last 3 messages

    messages$.next('Hello');
    messages$.next('How are you?');
    messages$.next('Fine thanks');
    messages$.next('Goodbye');

    // New subscriber gets last 3: 'How are you?', 'Fine thanks', 'Goodbye'
    messages$.subscribe(msg => console.log('Replayed:', msg));
  }

  /**
   * ASYNCSUBJECT - Only emits the LAST value, and only when complete()
   *
   * USE CASE: When you only care about the final result
   */
  asyncSubjectExample() {
    const result$ = new AsyncSubject<number>();

    result$.subscribe(val => console.log('Result:', val));

    result$.next(1);  // Not emitted yet
    result$.next(2);  // Not emitted yet
    result$.next(3);  // Not emitted yet

    result$.complete();  // NOW emits 3 (only the last value)
  }
}


// ============================================================
// LEVEL 8: LIFECYCLE OPERATORS (takeUntil, finalize, etc.)
// ============================================================

/**
 * TAKEUNTIL - Complete when another Observable emits
 *
 * USE CASE: Unsubscribe pattern in Angular components
 *
 * Java equivalent: takeUntil() in RxJava
 */
export class Level8_Lifecycle {

  private destroy$ = new Subject<void>();

  /**
   * THE ANGULAR UNSUBSCRIBE PATTERN
   * This is the most important pattern for preventing memory leaks!
   *
   * In a real component, you would add @Component decorator
   * and implement OnInit, OnDestroy interfaces
   */
  exampleNgOnInit() {
    // All subscriptions auto-unsubscribe when destroy$ emits
    interval(1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(val => console.log('Tick:', val));

    // Another subscription - also auto-unsubscribes
    this.someService().pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  exampleNgOnDestroy() {
    this.destroy$.next();     // Trigger completion
    this.destroy$.complete(); // Clean up the subject itself
  }

  private someService(): Observable<any> {
    return of('data');
  }

  /**
   * TAKE - Take first N values then complete
   */
  takeExample() {
    interval(1000).pipe(
      take(3)  // Only first 3 values: 0, 1, 2, then complete
    ).subscribe(val => console.log('Take:', val));
  }

  /**
   * TAKEWHILE - Take while condition is true
   */
  takeWhileExample() {
    interval(1000).pipe(
      takeWhile(val => val < 5)  // Take while value < 5
    ).subscribe(val => console.log('TakeWhile:', val));
  }

  /**
   * FIRST - Take only the first value (or first matching condition)
   */
  firstExample() {
    of(1, 2, 3, 4, 5).pipe(
      first(val => val > 2)  // First value > 2, which is 3
    ).subscribe(val => console.log('First:', val));
  }

  /**
   * SKIP - Skip first N values
   */
  skipExample() {
    of(1, 2, 3, 4, 5).pipe(
      skip(2)  // Skip first 2, emit 3, 4, 5
    ).subscribe(val => console.log('Skip:', val));
  }

  /**
   * FINALIZE - Run cleanup code on complete OR error
   *
   * Java equivalent: doFinally() in RxJava
   */
  finalizeExample(http: HttpClient) {
    // In real usage, isLoading would update component state
    http.get('/api/data').pipe(
      tap(() => console.log('Loading started')),
      finalize(() => {
        // This always runs, even on error - perfect for cleanup
        console.log('Loading complete');
      })
    ).subscribe();
  }
}


// ============================================================
// LEVEL 9: FILTERING & TIMING OPERATORS
// ============================================================

/**
 * Filtering and timing operators for controlling emissions
 */
export class Level9_FilteringTiming {

  /**
   * DEBOUNCETIME vs THROTTLETIME
   *
   * debounceTime: Wait for PAUSE in emissions (search-as-you-type)
   * throttleTime: Emit first, then ignore for duration (scroll events)
   */
  debounceVsThrottleExample() {
    const clicks$ = new Subject<number>();

    // DEBOUNCE: Waits for 300ms silence, then emits last value
    // Good for: search input, form validation
    clicks$.pipe(
      debounceTime(300)
    ).subscribe(val => console.log('Debounced:', val));

    // THROTTLE: Emits immediately, then ignores for 300ms
    // Good for: scroll events, resize events, button clicks
    clicks$.pipe(
      throttleTime(300)
    ).subscribe(val => console.log('Throttled:', val));

    // User clicks rapidly: 1, 2, 3, 4, 5
    // debounceTime: only emits 5 (after 300ms pause)
    // throttleTime: emits 1, then maybe 4 (first of each window)
  }

  /**
   * DISTINCTUNTILCHANGED - Skip consecutive duplicates
   *
   * Java equivalent: distinctUntilChanged() in RxJava
   */
  distinctExample() {
    of(1, 1, 2, 2, 2, 3, 1, 1).pipe(
      distinctUntilChanged()
    ).subscribe(val => console.log('Distinct:', val));
    // Output: 1, 2, 3, 1 (consecutive dupes removed)
  }

  /**
   * DISTINCTUNTILKEYCHANGED - Skip when object property hasn't changed
   */
  distinctKeyExample() {
    const users$ = of(
      { id: 1, name: 'John' },
      { id: 1, name: 'John Updated' },  // Same id, different name
      { id: 2, name: 'Jane' }
    );

    users$.pipe(
      distinctUntilKeyChanged('id')
    ).subscribe(user => console.log('User:', user));
    // Only emits when 'id' changes: {id:1}, {id:2}
  }

  /**
   * TIMEOUT - Error if no emission within duration
   */
  timeoutExample(http: HttpClient) {
    http.get('/api/slow-endpoint').pipe(
      timeout(5000),  // Error if no response within 5 seconds
      catchError(_err => {
        console.error('Request timed out!');
        return of(null);
      })
    ).subscribe();
  }
}


// ============================================================
// LEVEL 10: ACCUMULATION OPERATORS (scan, reduce)
// ============================================================

/**
 * Accumulation operators - building up state over time
 *
 * Java equivalent: scan/reduce in Streams, scan() in RxJava
 */
export class Level10_Accumulation {

  /**
   * SCAN - Emit accumulated value on EACH emission
   *
   * USE CASE: Running totals, state accumulation, Redux-like patterns
   */
  scanExample() {
    // Running total
    of(1, 2, 3, 4, 5).pipe(
      scan((acc, val) => acc + val, 0)
    ).subscribe(total => console.log('Running total:', total));
    // Output: 1, 3, 6, 10, 15

    // State accumulation (Redux-like)
    const actions$ = of(
      { type: 'ADD', item: 'Book' },
      { type: 'ADD', item: 'Pen' },
      { type: 'REMOVE', item: 'Book' }
    );

    actions$.pipe(
      scan((state: string[], action) => {
        switch (action.type) {
          case 'ADD': return [...state, action.item];
          case 'REMOVE': return state.filter(i => i !== action.item);
          default: return state;
        }
      }, [])
    ).subscribe(state => console.log('Cart state:', state));
    // Output: ['Book'], ['Book', 'Pen'], ['Pen']
  }

  /**
   * REDUCE - Only emit FINAL accumulated value (on complete)
   *
   * Java equivalent: reduce() in Streams
   */
  reduceExample() {
    of(1, 2, 3, 4, 5).pipe(
      reduce((acc, val) => acc + val, 0)
    ).subscribe(total => console.log('Final total:', total));
    // Output: 15 (only one emission)
  }

  /**
   * STARTWITH - Provide initial value before first emission
   *
   * USE CASE: Show loading state, provide default value
   */
  startWithExample(http: HttpClient) {
    http.get<Product[]>('/api/products').pipe(
      startWith([])  // Immediately emit empty array, then API result
    ).subscribe(_products => {
      // First emission: [] (show loading spinner)
      // Second emission: actual products (hide spinner, show data)
    });
  }

  /**
   * PAIRWISE - Emit previous and current value as pair
   *
   * USE CASE: Compare with previous value, detect changes
   */
  pairwiseExample() {
    of(1, 2, 3, 4).pipe(
      pairwise()
    ).subscribe(([prev, curr]) => {
      console.log(`Changed from ${prev} to ${curr}`);
    });
    // Output: [1,2], [2,3], [3,4]
  }
}


// ============================================================
// LEVEL 11: MULTICASTING & CACHING (share, shareReplay)
// ============================================================

/**
 * Multicasting operators - share a single subscription among multiple subscribers
 *
 * Problem: Without sharing, each subscriber triggers a new HTTP request
 * Solution: Use shareReplay to cache and share the result
 */
export class Level11_Multicasting {

  constructor(private http: HttpClient) {}

  /**
   * PROBLEM: Multiple subscribers = multiple HTTP requests
   */
  withoutShareReplay() {
    const products$ = this.http.get<Product[]>('/api/products');

    products$.subscribe(p => console.log('Subscriber 1:', p.length));
    products$.subscribe(p => console.log('Subscriber 2:', p.length));
    // TWO HTTP requests made!
  }

  /**
   * SHAREREPLAY - Cache the last N emissions, share among subscribers
   *
   * USE CASE: Cache API responses, share expensive computations
   */
  withShareReplay() {
    const products$ = this.http.get<Product[]>('/api/products').pipe(
      tap(() => console.log('HTTP request made')),
      shareReplay(1)  // Cache last 1 emission
    );

    products$.subscribe(p => console.log('Subscriber 1:', p.length));
    products$.subscribe(p => console.log('Subscriber 2:', p.length));
    // Only ONE HTTP request made! Both subscribers get same result

    // Even late subscribers get the cached value
    setTimeout(() => {
      products$.subscribe(p => console.log('Late subscriber:', p.length));
      // No new HTTP request - uses cached value
    }, 5000);
  }

  /**
   * SHARE - Share without replay (no caching for late subscribers)
   */
  shareExample() {
    const source$ = interval(1000).pipe(
      tap(val => console.log('Source emitted:', val)),
      share()
    );

    source$.subscribe(val => console.log('A:', val));

    setTimeout(() => {
      source$.subscribe(val => console.log('B:', val));
      // B starts from current value, not from beginning
    }, 2500);
  }

  /**
   * Real-world: Service with cached data
   */
  private productsCache$: Observable<Product[]> | null = null;

  getProducts(): Observable<Product[]> {
    if (!this.productsCache$) {
      this.productsCache$ = this.http.get<Product[]>('/api/products').pipe(
        shareReplay(1)
      );
    }
    return this.productsCache$;
  }

  clearCache() {
    this.productsCache$ = null;
  }
}


// ============================================================
// LEVEL 12: WITHLATESTFROM & MORE COMBINATIONS
// ============================================================

/**
 * Additional combination operators
 */
export class Level12_MoreCombinations {

  /**
   * WITHLATESTFROM - Combine with latest value from another Observable
   *
   * Unlike combineLatest: only emits when SOURCE emits (not when either emits)
   *
   * USE CASE: Add context to events (click + current user)
   */
  withLatestFromExample() {
    const clicks$ = new Subject<void>();
    const currentUser$ = new BehaviorSubject<string>('John');

    clicks$.pipe(
      withLatestFrom(currentUser$)
    ).subscribe(([_, user]) => {
      console.log(`Click by user: ${user}`);
    });

    // Only click triggers emission, but includes latest user
    currentUser$.next('Jane');  // No emission
    clicks$.next();              // Emits: ['click', 'Jane']
    currentUser$.next('Bob');    // No emission
    clicks$.next();              // Emits: ['click', 'Bob']
  }

  /**
   * Difference: combineLatest vs withLatestFrom
   */
  comparisonExample() {
    const a$ = new Subject<string>();
    const b$ = new Subject<number>();

    // combineLatest: emits when EITHER changes
    combineLatest([a$, b$]).subscribe(([a, b]) =>
      console.log(`combineLatest: ${a}, ${b}`)
    );

    // withLatestFrom: only emits when a$ changes
    a$.pipe(
      withLatestFrom(b$)
    ).subscribe(([a, b]) =>
      console.log(`withLatestFrom: ${a}, ${b}`)
    );

    a$.next('a1');  // Nothing yet (b$ hasn't emitted)
    b$.next(1);     // combineLatest emits [a1, 1], withLatestFrom nothing
    a$.next('a2');  // Both emit [a2, 1]
    b$.next(2);     // Only combineLatest emits [a2, 2]
  }
}


// ============================================================
// LEVEL 13: RETRY STRATEGIES
// ============================================================

/**
 * Error retry strategies
 */
export class Level13_RetryStrategies {

  constructor(private http: HttpClient) {}

  /**
   * RETRY - Simple retry N times
   */
  simpleRetry() {
    this.http.get('/api/flaky-endpoint').pipe(
      retry(3),  // Retry up to 3 times on error
      catchError(_err => {
        console.error('Failed after 3 retries');
        return of(null);
      })
    ).subscribe();
  }

  /**
   * RETRY with delay - Exponential backoff
   */
  retryWithBackoff() {
    this.http.get('/api/flaky-endpoint').pipe(
      retry({
        count: 3,
        delay: (_error, retryCount) => {
          const delayMs = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
          console.log(`Retry ${retryCount} after ${delayMs}ms`);
          return timer(delayMs);
        }
      }),
      catchError(_err => of(null))
    ).subscribe();
  }

  /**
   * Conditional retry - only retry on specific errors
   */
  conditionalRetry() {
    this.http.get('/api/endpoint').pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => {
          // Only retry on 5xx errors or network errors
          if (error.status >= 500 || error.status === 0) {
            return timer(1000 * retryCount);
          }
          // Don't retry 4xx errors (client errors)
          return throwError(() => error);
        }
      })
    ).subscribe();
  }
}


// ============================================================
// SUMMARY: Complete RxJS Operator Reference
// ============================================================
/*

TRANSFORMATION OPERATORS:
| Operator              | Use When                                        |
|-----------------------|-------------------------------------------------|
| map                   | Transform each value                            |
| tap                   | Side effects (logging, debugging)               |
| scan                  | Running accumulation (emit each step)           |
| reduce                | Final accumulation (emit only final)            |
| startWith             | Provide initial value                           |
| pairwise              | Get previous and current value                  |

FILTERING OPERATORS:
| Operator              | Use When                                        |
|-----------------------|-------------------------------------------------|
| filter                | Keep values matching condition                  |
| take                  | Take first N values                             |
| takeUntil             | Complete when notifier emits (UNSUBSCRIBE!)     |
| takeWhile             | Take while condition is true                    |
| first                 | Take first (or first matching)                  |
| last                  | Take last value                                 |
| skip                  | Skip first N values                             |
| distinctUntilChanged  | Skip consecutive duplicates                     |
| debounceTime          | Wait for pause (search input)                   |
| throttleTime          | Rate limit (scroll, resize)                     |

FLATTENING OPERATORS:
| Operator      | Parallel? | Cancels? | Use When                        |
|---------------|-----------|----------|---------------------------------|
| switchMap     | No        | YES      | Search, route changes           |
| mergeMap      | Yes       | No       | Parallel fetches                |
| concatMap     | No        | No       | Sequential saves                |
| exhaustMap    | No        | Ignores  | Prevent double-submit           |

COMBINATION OPERATORS:
| Operator        | Use When                                        |
|-----------------|-------------------------------------------------|
| forkJoin        | Wait for ALL to complete (one-time)             |
| combineLatest   | React to ANY change (ongoing)                   |
| withLatestFrom  | Combine on source emit only                     |

SUBJECTS:
| Subject         | Initial Value | Replay | Use When                      |
|-----------------|---------------|--------|-------------------------------|
| Subject         | No            | No     | Event bus                     |
| BehaviorSubject | Yes (required)| Last 1 | Current state (user, filters) |
| ReplaySubject   | No            | Last N | Cache events, chat history    |
| AsyncSubject    | No            | Last 1 | Only care about final result  |

MULTICASTING:
| Operator    | Use When                                          |
|-------------|---------------------------------------------------|
| share       | Share subscription (no cache for late)            |
| shareReplay | Cache & share (late subscribers get cached value) |

ERROR HANDLING:
| Operator    | Use When                                          |
|-------------|---------------------------------------------------|
| catchError  | Handle errors, provide fallback                   |
| retry       | Retry N times on error                            |
| timeout     | Error if no emission within duration              |
| finalize    | Cleanup on complete OR error                      |

┌─────────────────────────────────────────────────────────────────┐
│                     QUICK DECISION GUIDE                         │
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
