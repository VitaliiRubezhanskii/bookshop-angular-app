import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { tap, withLatestFrom } from 'rxjs/operators';
import * as CartActions from './cart.actions';
import { selectCartItems } from './cart.selectors';

/**
 * NgRx Effects for Cart
 *
 * Handles side effects like persisting cart to localStorage.
 * Demonstrates effects that don't dispatch new actions.
 */

@Injectable()
export class CartEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);

  /**
   * Persist cart to localStorage on any cart change
   *
   * Notice: dispatch: false means this effect doesn't dispatch a new action
   */
  persistCart$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          CartActions.addToCart,
          CartActions.removeFromCart,
          CartActions.updateCartItemQuantity,
          CartActions.incrementQuantity,
          CartActions.decrementQuantity,
          CartActions.clearCart
        ),
        withLatestFrom(this.store.select(selectCartItems)),
        tap(([_, items]) => {
          localStorage.setItem('cart', JSON.stringify(items));
          console.log('🛒 Cart persisted to localStorage:', items);
        })
      ),
    { dispatch: false }
  );

  /**
   * Load cart from localStorage on app init
   */
  loadCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.loadCart),
      tap(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const items = JSON.parse(savedCart);
          this.store.dispatch(CartActions.loadCartSuccess({ items }));
        }
      })
    ),
    { dispatch: false }
  );
}
