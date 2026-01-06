import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, BehaviorSubject, of, from, forkJoin, combineLatest, Subscription } from 'rxjs';
import { map, tap, switchMap, mergeMap, concatMap, exhaustMap, debounceTime, distinctUntilChanged, delay } from 'rxjs/operators';

/**
 * RxJS Playground Component
 *
 * Run the app and navigate to /rxjs-playground to see operators in action.
 * Open browser console (F12) to see the output.
 */
@Component({
  selector: 'app-rxjs-playground',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 20px; font-family: monospace;">
      <h1>RxJS Playground</h1>
      <p>Open browser console (F12) to see results!</p>

      <hr>

      <!-- SECTION 1: Basic Operators -->
      <h2>1. Basic Operators (map, tap, filter)</h2>
      <button (click)="runMapExample()">Run map()</button>
      <button (click)="runTapExample()">Run tap()</button>

      <hr>

      <!-- SECTION 2: switchMap Demo -->
      <h2>2. switchMap - Search Demo</h2>
      <p>Type fast and watch console - only last search runs!</p>
      <input
        type="text"
        [ngModel]="searchTerm"
        (ngModelChange)="onSearchChange($event)"
        placeholder="Type to search..."
        style="padding: 8px; width: 300px;"
      >
      <div *ngIf="searchResults.length">
        <p>Results: {{ searchResults | json }}</p>
      </div>

      <hr>

      <!-- SECTION 3: mergeMap vs concatMap vs switchMap -->
      <h2>3. Compare: mergeMap vs concatMap vs switchMap</h2>
      <button (click)="runMergeMapDemo()">Run mergeMap (parallel)</button>
      <button (click)="runConcatMapDemo()">Run concatMap (sequential)</button>
      <button (click)="runSwitchMapDemo()">Run switchMap (cancel previous)</button>

      <hr>

      <!-- SECTION 4: forkJoin -->
      <h2>4. forkJoin - Wait for all</h2>
      <button (click)="runForkJoinDemo()">Run forkJoin</button>

      <hr>

      <!-- SECTION 5: combineLatest -->
      <h2>5. combineLatest - React to any change</h2>
      <div>
        <label>Category: </label>
        <select (change)="onCategoryChange($event)">
          <option value="all">All</option>
          <option value="books">Books</option>
          <option value="electronics">Electronics</option>
        </select>

        <label style="margin-left: 20px;">Sort: </label>
        <select (change)="onSortChange($event)">
          <option value="name">Name</option>
          <option value="price">Price</option>
        </select>
      </div>
      <p>Combined filters: {{ currentFilters | json }}</p>

      <hr>

      <!-- SECTION 6: exhaustMap -->
      <h2>6. exhaustMap - Prevent double-click</h2>
      <p>Click rapidly - only first click processes until done!</p>
      <button (click)="onSubmitClick()">Submit Order (click fast!)</button>
      <p>Submit count: {{ submitCount }}</p>

      <hr>

      <h2>Log Output</h2>
      <div style="background: #1e1e1e; color: #0f0; padding: 10px; height: 200px; overflow-y: auto;">
        <div *ngFor="let log of logs">{{ log }}</div>
      </div>
      <button (click)="clearLogs()">Clear Logs</button>
    </div>
  `
})
export class RxjsPlaygroundComponent implements OnInit, OnDestroy {

  // Search demo
  searchTerm = '';
  searchTerm$ = new Subject<string>();
  searchResults: string[] = [];

  // Filter demo
  category$ = new BehaviorSubject<string>('all');
  sort$ = new BehaviorSubject<string>('name');
  currentFilters: any = {};

  // exhaustMap demo
  submit$ = new Subject<void>();
  submitCount = 0;

  // Logging
  logs: string[] = [];

  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.setupSearchDemo();
    this.setupCombineLatestDemo();
    this.setupExhaustMapDemo();
    this.log('🚀 RxJS Playground initialized!');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ============ BASIC OPERATORS ============

  runMapExample() {
    this.log('--- map() example ---');
    const numbers = [1, 2, 3, 4, 5];

    from(numbers).pipe(
      map(n => n * 10),
      tap(result => this.log(`Mapped: ${result}`))
    ).subscribe();
  }

  runTapExample() {
    this.log('--- tap() example (side effects) ---');

    of({ name: 'Book', price: 29.99 }).pipe(
      tap(product => this.log(`Before: ${JSON.stringify(product)}`)),
      map(product => ({ ...product, discounted: product.price * 0.9 })),
      tap(product => this.log(`After discount: ${JSON.stringify(product)}`))
    ).subscribe();
  }

  // ============ SWITCHMAP DEMO ============

  setupSearchDemo() {
    const sub = this.searchTerm$.pipe(
      tap(term => this.log(`Keystroke: "${term}"`)),
      debounceTime(300),
      distinctUntilChanged(),
      tap(term => this.log(`After debounce: "${term}" - now searching...`)),
      switchMap(term => this.fakeSearch(term))
    ).subscribe(results => {
      this.searchResults = results;
      this.log(`Search results: ${JSON.stringify(results)}`);
    });

    this.subscriptions.push(sub);
  }

  onSearchChange(term: string) {
    this.searchTerm = term;
    this.searchTerm$.next(term);
  }

  fakeSearch(term: string) {
    // Simulate API call with random delay
    const delayMs = Math.random() * 1000 + 500;
    return of([`${term}-result1`, `${term}-result2`]).pipe(
      delay(delayMs),
      tap(() => this.log(`API returned for "${term}" after ${delayMs.toFixed(0)}ms`))
    );
  }

  // ============ MERGEMAP VS CONCATMAP VS SWITCHMAP ============

  runMergeMapDemo() {
    this.log('--- mergeMap (PARALLEL) ---');

    from([1, 2, 3]).pipe(
      mergeMap(id => this.fakeApiCall(id))
    ).subscribe(result => this.log(`mergeMap result: ${result}`));
  }

  runConcatMapDemo() {
    this.log('--- concatMap (SEQUENTIAL) ---');

    from([1, 2, 3]).pipe(
      concatMap(id => this.fakeApiCall(id))
    ).subscribe(result => this.log(`concatMap result: ${result}`));
  }

  runSwitchMapDemo() {
    this.log('--- switchMap (CANCEL PREVIOUS) ---');

    // Emit 1, 2, 3 quickly - only 3 should complete
    const source$ = new Subject<number>();

    source$.pipe(
      tap(id => this.log(`Emitting ${id}...`)),
      switchMap(id => this.fakeApiCall(id))
    ).subscribe(result => this.log(`switchMap result: ${result}`));

    // Emit quickly
    source$.next(1);
    setTimeout(() => source$.next(2), 100);
    setTimeout(() => source$.next(3), 200);
  }

  fakeApiCall(id: number) {
    const delayMs = 1000; // Fixed 1 second delay
    this.log(`  API call started for ID ${id}`);
    return of(`Product-${id}`).pipe(
      delay(delayMs),
      tap(() => this.log(`  API call completed for ID ${id}`))
    );
  }

  // ============ FORKJOIN DEMO ============

  runForkJoinDemo() {
    this.log('--- forkJoin (WAIT FOR ALL) ---');

    forkJoin({
      products: of(['Book', 'Laptop']).pipe(delay(1000), tap(() => this.log('Products loaded'))),
      categories: of(['Fiction', 'Tech']).pipe(delay(500), tap(() => this.log('Categories loaded'))),
      user: of({ name: 'John' }).pipe(delay(1500), tap(() => this.log('User loaded')))
    }).subscribe(result => {
      this.log(`All loaded: ${JSON.stringify(result)}`);
    });
  }

  // ============ COMBINELATEST DEMO ============

  setupCombineLatestDemo() {
    const sub = combineLatest([this.category$, this.sort$]).pipe(
      tap(([cat, sort]) => this.log(`Filters changed: category=${cat}, sort=${sort}`)),
      map(([category, sort]) => ({ category, sort }))
    ).subscribe(filters => {
      this.currentFilters = filters;
    });

    this.subscriptions.push(sub);
  }

  onCategoryChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.category$.next(value);
  }

  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.sort$.next(value);
  }

  // ============ EXHAUSTMAP DEMO ============

  setupExhaustMapDemo() {
    const sub = this.submit$.pipe(
      tap(() => this.log('Click received...')),
      exhaustMap(() => {
        this.log('Processing order (2 seconds)...');
        return of('Order confirmed!').pipe(
          delay(2000),
          tap(() => this.submitCount++)
        );
      })
    ).subscribe(result => {
      this.log(`✅ ${result}`);
    });

    this.subscriptions.push(sub);
  }

  onSubmitClick() {
    this.submit$.next();
  }

  // ============ LOGGING ============

  log(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.push(`[${timestamp}] ${message}`);
    console.log(message);
  }

  clearLogs() {
    this.logs = [];
  }
}
