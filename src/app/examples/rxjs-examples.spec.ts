import { fakeAsync, tick } from '@angular/core/testing';
import { of, from, Subject, BehaviorSubject, forkJoin } from 'rxjs';
import { map, tap, switchMap, mergeMap, concatMap, delay, toArray, debounceTime } from 'rxjs/operators';

/**
 * RxJS Operators Unit Tests
 *
 * Run with: ng test --include="**\/rxjs-examples.spec.ts"
 */
describe('RxJS Operators', () => {

  // ============ BASIC OPERATORS ============

  describe('map()', () => {
    it('should transform values', (done) => {
      const source$ = of(1, 2, 3);

      source$.pipe(
        map(x => x * 10),
        toArray()
      ).subscribe(result => {
        expect(result).toEqual([10, 20, 30]);
        done();
      });
    });

    it('should transform objects', (done) => {
      const product = { name: 'Book', price: 100 };

      of(product).pipe(
        map(p => ({ ...p, discounted: p.price * 0.9 }))
      ).subscribe(result => {
        expect(result.discounted).toBe(90);
        done();
      });
    });
  });

  describe('tap()', () => {
    it('should perform side effects without modifying stream', (done) => {
      const sideEffects: number[] = [];

      of(1, 2, 3).pipe(
        tap(x => sideEffects.push(x)),
        map(x => x * 10),
        toArray()
      ).subscribe(result => {
        expect(sideEffects).toEqual([1, 2, 3]);  // Original values
        expect(result).toEqual([10, 20, 30]);    // Transformed values
        done();
      });
    });
  });

  // ============ FLATTENING OPERATORS ============

  describe('switchMap()', () => {
    it('should cancel previous inner observable', fakeAsync(() => {
      const results: string[] = [];
      const source$ = new Subject<number>();

      source$.pipe(
        switchMap(id => of(`result-${id}`).pipe(delay(100)))
      ).subscribe(result => results.push(result));

      // Emit 1, then quickly emit 2 (before 1 completes)
      source$.next(1);
      tick(50);  // 1 is still processing
      source$.next(2);  // This cancels 1
      tick(150);  // 2 completes

      // Only result-2 should be in results (result-1 was cancelled)
      expect(results).toEqual(['result-2']);
    }));
  });

  describe('mergeMap()', () => {
    it('should run all inner observables in parallel', fakeAsync(() => {
      const results: string[] = [];

      from([1, 2, 3]).pipe(
        mergeMap(id => of(`result-${id}`).pipe(delay(100)))
      ).subscribe(result => results.push(result));

      tick(150);  // All complete at roughly the same time

      // All results should be present
      expect(results.length).toBe(3);
      expect(results).toContain('result-1');
      expect(results).toContain('result-2');
      expect(results).toContain('result-3');
    }));
  });

  describe('concatMap()', () => {
    it('should run inner observables sequentially', fakeAsync(() => {
      const order: number[] = [];

      from([1, 2, 3]).pipe(
        concatMap(id => of(id).pipe(
          delay(100),
          tap(x => order.push(x))
        ))
      ).subscribe();

      tick(350);  // 3 * 100ms + buffer

      // Should be in exact order
      expect(order).toEqual([1, 2, 3]);
    }));
  });

  // ============ COMBINATION OPERATORS ============

  describe('forkJoin()', () => {
    it('should wait for all observables to complete', fakeAsync(() => {
      let result: any = null;

      forkJoin({
        a: of('A').pipe(delay(100)),
        b: of('B').pipe(delay(200)),
        c: of('C').pipe(delay(50))
      }).subscribe(r => result = r);

      tick(50);
      expect(result).toBeNull();  // Not complete yet

      tick(100);
      expect(result).toBeNull();  // Still waiting for 'b'

      tick(100);
      expect(result).toEqual({ a: 'A', b: 'B', c: 'C' });  // All complete
    }));
  });

  describe('combineLatest simulation', () => {
    it('should emit when any source emits', () => {
      const category$ = new BehaviorSubject('all');
      const sort$ = new BehaviorSubject('name');
      const results: any[] = [];

      // Simulating combineLatest behavior
      category$.subscribe(cat => {
        results.push({ category: cat, sort: sort$.getValue() });
      });

      expect(results.length).toBe(1);
      expect(results[0]).toEqual({ category: 'all', sort: 'name' });

      category$.next('books');
      expect(results.length).toBe(2);
      expect(results[1]).toEqual({ category: 'books', sort: 'name' });
    });
  });

  // ============ DEBOUNCE (Search scenario) ============

  describe('debounceTime()', () => {
    it('should wait for pause in emissions', fakeAsync(() => {
      const results: string[] = [];
      const search$ = new Subject<string>();

      search$.pipe(
        debounceTime(300)
      ).subscribe(term => results.push(term));

      // Type "book" quickly
      search$.next('b');
      tick(100);
      search$.next('bo');
      tick(100);
      search$.next('boo');
      tick(100);
      search$.next('book');
      tick(300);  // Wait for debounce

      // Only final value should emit
      expect(results).toEqual(['book']);
    }));
  });

  // ============ REAL WORLD SCENARIO ============

  describe('Search-as-you-type pattern', () => {
    it('should debounce and switch to latest search', fakeAsync(() => {
      const searchResults: string[][] = [];
      const searchTerm$ = new Subject<string>();

      // Fake search API
      const fakeSearch = (term: string) =>
        of([`${term}-result1`, `${term}-result2`]).pipe(delay(500));

      searchTerm$.pipe(
        debounceTime(300),
        switchMap(term => fakeSearch(term))
      ).subscribe(results => searchResults.push(results));

      // User types "angular" with pauses
      searchTerm$.next('a');
      tick(100);
      searchTerm$.next('an');
      tick(100);
      searchTerm$.next('ang');
      tick(400);  // Pause > 300ms, triggers search for "ang"

      searchTerm$.next('angu');
      tick(100);
      searchTerm$.next('angul');
      tick(400);  // Triggers search for "angul", cancels "ang" search

      tick(600);  // Let final search complete

      // Should only have result for "angul" (ang was cancelled)
      expect(searchResults.length).toBe(1);
      expect(searchResults[0]).toEqual(['angul-result1', 'angul-result2']);
    }));
  });
});
