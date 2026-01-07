import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, delay } from 'rxjs/operators';
import * as ProductActions from './products.actions';
import { Product } from './products.actions';

/**
 * NgRx Effects for Products
 *
 * Effects handle side effects like API calls, localStorage, etc.
 * They listen for actions, perform async operations, and dispatch new actions.
 *
 * Java equivalent: Think of them like @Async service methods or message listeners
 * that react to events and produce new events.
 */

@Injectable()
export class ProductsEffects {
  private actions$ = inject(Actions);

  /**
   * Load products effect
   *
   * Listens for loadProducts action → makes API call → dispatches success/failure
   *
   * Flow: loadProducts → (API) → loadProductsSuccess or loadProductsFailure
   */
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      switchMap(() =>
        // Simulated API call - replace with real HTTP service
        this.fetchProducts().pipe(
          map((products) => ProductActions.loadProductsSuccess({ products })),
          catchError((error) =>
            of(ProductActions.loadProductsFailure({ error: error.message }))
          )
        )
      )
    )
  );

  /**
   * Simulated API call
   * In real app, inject HttpClient and call your backend
   */
  private fetchProducts() {
    const mockProducts: Product[] = [
      { id: 1, name: 'Clean Code', price: 39.99, category: 'Programming', description: 'A Handbook of Agile Software Craftsmanship' },
      { id: 2, name: 'The Pragmatic Programmer', price: 49.99, category: 'Programming', description: 'Your Journey To Mastery' },
      { id: 3, name: 'Design Patterns', price: 54.99, category: 'Programming', description: 'Elements of Reusable Object-Oriented Software' },
      { id: 4, name: 'Refactoring', price: 44.99, category: 'Programming', description: 'Improving the Design of Existing Code' },
      { id: 5, name: 'Domain-Driven Design', price: 59.99, category: 'Architecture', description: 'Tackling Complexity in the Heart of Software' },
    ];

    // Simulate network delay
    return of(mockProducts).pipe(delay(800));
  }
}
