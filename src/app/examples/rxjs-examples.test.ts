/**
 * Standalone RxJS Tests - Run with ts-node or jest
 *
 * To run: npx ts-node src/app/examples/rxjs-examples.test.ts
 */

import { of, from, Subject, BehaviorSubject, forkJoin } from 'rxjs';
import { map, tap, switchMap, mergeMap, concatMap, delay, toArray, debounceTime } from 'rxjs/operators';

// Simple test framework
let passed = 0;
let failed = 0;

function describe(name: string, fn: () => void) {
  console.log(`\n📦 ${name}`);
  fn();
}

function it(name: string, fn: () => void | Promise<void>) {
  try {
    const result = fn();
    if (result instanceof Promise) {
      result.then(() => {
        console.log(`  ✅ ${name}`);
        passed++;
      }).catch((err) => {
        console.log(`  ❌ ${name}: ${err.message}`);
        failed++;
      });
    } else {
      console.log(`  ✅ ${name}`);
      passed++;
    }
  } catch (err: any) {
    console.log(`  ❌ ${name}: ${err.message}`);
    failed++;
  }
}

function expect<T>(actual: T) {
  return {
    toEqual(expected: T) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toContain(expected: any) {
      if (Array.isArray(actual) && !actual.includes(expected)) {
        throw new Error(`Expected array to contain ${expected}`);
      }
    }
  };
}

// ============ TESTS ============

describe('RxJS map()', () => {
  it('should transform values', () => {
    return new Promise<void>((resolve) => {
      of(1, 2, 3).pipe(
        map(x => x * 10),
        toArray()
      ).subscribe(result => {
        expect(result).toEqual([10, 20, 30]);
        resolve();
      });
    });
  });

  it('should transform objects', () => {
    return new Promise<void>((resolve) => {
      const product = { name: 'Book', price: 100 };
      of(product).pipe(
        map(p => ({ ...p, discounted: p.price * 0.9 }))
      ).subscribe(result => {
        expect(result.discounted).toBe(90);
        resolve();
      });
    });
  });
});

describe('RxJS tap()', () => {
  it('should perform side effects without modifying stream', () => {
    return new Promise<void>((resolve) => {
      const sideEffects: number[] = [];

      of(1, 2, 3).pipe(
        tap(x => sideEffects.push(x)),
        map(x => x * 10),
        toArray()
      ).subscribe(result => {
        expect(sideEffects).toEqual([1, 2, 3]);
        expect(result).toEqual([10, 20, 30]);
        resolve();
      });
    });
  });
});

describe('RxJS mergeMap()', () => {
  it('should run all inner observables in parallel', () => {
    return new Promise<void>((resolve) => {
      const results: string[] = [];

      from([1, 2, 3]).pipe(
        mergeMap(id => of(`result-${id}`).pipe(delay(10))),
        toArray()
      ).subscribe(allResults => {
        expect(allResults.length).toBe(3);
        expect(allResults).toContain('result-1');
        expect(allResults).toContain('result-2');
        expect(allResults).toContain('result-3');
        resolve();
      });
    });
  });
});

describe('RxJS concatMap()', () => {
  it('should run inner observables sequentially', () => {
    return new Promise<void>((resolve) => {
      const order: number[] = [];

      from([1, 2, 3]).pipe(
        concatMap(id => of(id).pipe(
          delay(10),
          tap(x => order.push(x))
        )),
        toArray()
      ).subscribe(() => {
        expect(order).toEqual([1, 2, 3]);
        resolve();
      });
    });
  });
});

describe('RxJS forkJoin()', () => {
  it('should wait for all observables to complete', () => {
    return new Promise<void>((resolve) => {
      forkJoin({
        a: of('A').pipe(delay(30)),
        b: of('B').pipe(delay(20)),
        c: of('C').pipe(delay(10))
      }).subscribe(result => {
        expect(result).toEqual({ a: 'A', b: 'B', c: 'C' });
        resolve();
      });
    });
  });
});

describe('RxJS BehaviorSubject', () => {
  it('should provide current value to new subscribers', () => {
    const subject = new BehaviorSubject<string>('initial');
    const values: string[] = [];

    subject.subscribe(v => values.push(v));
    subject.next('second');

    const lateValues: string[] = [];
    subject.subscribe(v => lateValues.push(v));

    expect(values).toEqual(['initial', 'second']);
    expect(lateValues).toEqual(['second']); // Late subscriber gets current value
  });
});

describe('RxJS switchMap()', () => {
  it('should cancel previous inner observable', () => {
    return new Promise<void>((resolve) => {
      const results: string[] = [];
      const source$ = new Subject<number>();

      source$.pipe(
        switchMap(id => of(`result-${id}`).pipe(delay(50)))
      ).subscribe(result => results.push(result));

      // Emit 1, then quickly emit 2 (before 1 completes)
      source$.next(1);
      setTimeout(() => source$.next(2), 10); // Cancel 1

      setTimeout(() => {
        // Only result-2 should be present
        expect(results).toEqual(['result-2']);
        resolve();
      }, 100);
    });
  });
});

// Run summary after all tests
setTimeout(() => {
  console.log(`\n${'='.repeat(40)}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`${'='.repeat(40)}`);
  process.exit(failed > 0 ? 1 : 0);
}, 500);
