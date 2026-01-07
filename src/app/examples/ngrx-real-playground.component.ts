import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

// Import from our store
import {
  AppState,
  // Products
  loadProducts,
  selectAllProducts,
  selectProductsLoading,
  selectProductsError,
  selectProductCount,
  Product,
  // Cart
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
  selectIsCartEmpty,
  CartItem,
} from '../store';

/**
 * Real NgRx Playground Component
 *
 * This component uses the REAL NgRx Store (not simulated).
 * It demonstrates:
 * - Injecting Store
 * - Dispatching Actions
 * - Selecting State with Selectors
 * - Using async pipe for subscriptions
 *
 * Navigate to: /ngrx-real-playground
 */

@Component({
  selector: 'app-ngrx-real-playground',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: monospace; max-width: 1200px; margin: 0 auto;">
      <h1>🏪 Real NgRx Store Playground</h1>
      <p>This uses the REAL &#64;ngrx/store package!</p>
      <p style="color: #666;">
        Open Redux DevTools (browser extension) to inspect state changes.
        <a href="https://chrome.google.com/webstore/detail/redux-devtools" target="_blank">Get it here</a>
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">

        <!-- LEFT: Products -->
        <div>
          <h2>📦 Products</h2>

          <div style="margin-bottom: 15px;">
            <button (click)="onLoadProducts()" [disabled]="loading$ | async">
              {{ (loading$ | async) ? 'Loading...' : 'Load Products' }}
            </button>
          </div>

          <!-- Error -->
          <div *ngIf="error$ | async as error" style="color: red; margin-bottom: 10px;">
            Error: {{ error }}
          </div>

          <!-- Products List -->
          <div *ngIf="(products$ | async)?.length" style="background: #f5f5f5; padding: 10px; border-radius: 5px;">
            <div *ngFor="let product of products$ | async"
                 style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #ddd;">
              <div>
                <strong>{{ product.name }}</strong><br>
                <small style="color: #666;">{{ product.description }}</small><br>
                <span style="color: #2196f3;">\${{ product.price }}</span>
              </div>
              <button (click)="onAddToCart(product)" style="height: fit-content;">
                Add to Cart
              </button>
            </div>
          </div>

          <div *ngIf="!(products$ | async)?.length && !(loading$ | async)" style="color: #999;">
            Click "Load Products" to fetch products via Effect
          </div>

          <div style="margin-top: 10px; color: #666;">
            Total Products: {{ productCount$ | async }}
          </div>

          <hr style="margin: 20px 0;">

          <!-- Code Example -->
          <h3>💻 Code Used</h3>
          <pre style="background: #263238; color: #aed581; padding: 15px; overflow: auto; font-size: 11px;" [innerHTML]="codeExample"></pre>
        </div>

        <!-- RIGHT: Cart -->
        <div>
          <h2>🛒 Shopping Cart</h2>

          <!-- Cart Summary -->
          <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <div style="font-size: 18px; font-weight: bold;">
              Items: {{ cartItemCount$ | async }} |
              Total: \${{ (cartTotal$ | async)?.toFixed(2) }}
            </div>
          </div>

          <!-- Cart Items -->
          <div *ngIf="!(isCartEmpty$ | async)">
            <div *ngFor="let item of cartItems$ | async"
                 style="display: flex; justify-content: space-between; align-items: center;
                        padding: 10px; background: #fff; margin-bottom: 5px;
                        border: 1px solid #ddd; border-radius: 3px;">
              <div>
                <strong>{{item.name}}</strong><br>
                <small>\${{ item.price }} × {{ item.quantity }} = \${{ (item.price * item.quantity).toFixed(2) }}</small>
              </div>
              <div>
                <button (click)="onDecrement(item.productId)">−</button>
                <span style="margin: 0 10px;">{{ item.quantity }}</span>
                <button (click)="onIncrement(item.productId)">+</button>
                <button (click)="onRemove(item.productId)"
                        style="margin-left: 10px; color: red;">×</button>
              </div>
            </div>

            <button (click)="onClearCart()"
                    style="margin-top: 10px; background: #f44336; color: white;
                           border: none; padding: 8px 16px; cursor: pointer;">
              Clear Cart
            </button>
          </div>

          <div *ngIf="isCartEmpty$ | async" style="color: #999;">
            Cart is empty. Add some products!
          </div>

          <hr style="margin: 20px 0;">

          <!-- Data Flow Diagram -->
          <h3>📊 NgRx Data Flow</h3>
          <div style="background: #fff3e0; padding: 15px; border-radius: 5px; font-size: 12px;">
            <pre style="margin: 0;">
┌─────────────────────────────────────────────────┐
│                   COMPONENT                      │
│  ┌───────────────┐       ┌──────────────────┐   │
│  │ store.dispatch│       │ store.select()   │   │
│  │   (actions)   │       │  (observables)   │   │
│  └───────┬───────┘       └────────▲─────────┘   │
└──────────┼────────────────────────┼─────────────┘
           │                        │
           ▼                        │
┌──────────────────┐    ┌───────────┴──────────┐
│     ACTIONS      │    │     SELECTORS        │
│ loadProducts()   │    │ selectAllProducts()  │
│ addToCart()      │    │ selectCartTotal()    │
└────────┬─────────┘    └───────────▲──────────┘
         │                          │
         ▼                          │
┌──────────────────┐    ┌───────────┴──────────┐
│     EFFECTS      │───▶│      REDUCERS        │
│ (side effects)   │    │ (pure functions)     │
│ API calls, etc.  │    │ Return new state     │
└──────────────────┘    └───────────┬──────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │        STORE          │
                        │   (single source of   │
                        │        truth)         │
                        └───────────────────────┘
            </pre>
          </div>
        </div>
      </div>

      <hr style="margin: 30px 0;">

      <!-- Comparison -->
      <h2>🔄 Simulated vs Real NgRx</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #f5f5f5;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Feature</th>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Simulated (BehaviorSubject)</th>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Real NgRx</th>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Store</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Custom class</td>
          <td style="padding: 10px; border: 1px solid #ddd;">&#64;ngrx/store</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Actions</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Plain objects</td>
          <td style="padding: 10px; border: 1px solid #ddd;">createAction() with props</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Reducers</td>
          <td style="padding: 10px; border: 1px solid #ddd;">switch/case</td>
          <td style="padding: 10px; border: 1px solid #ddd;">createReducer() with on()</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Selectors</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Simple functions</td>
          <td style="padding: 10px; border: 1px solid #ddd;">createSelector() (memoized)</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Effects</td>
          <td style="padding: 10px; border: 1px solid #ddd;">setTimeout</td>
          <td style="padding: 10px; border: 1px solid #ddd;">createEffect() + Actions$</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">DevTools</td>
          <td style="padding: 10px; border: 1px solid #ddd;">❌ Manual logging</td>
          <td style="padding: 10px; border: 1px solid #ddd;">✅ Redux DevTools</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Type Safety</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Manual</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Built-in</td>
        </tr>
      </table>

      <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 5px;">
        <strong>💡 Tip:</strong> Try the
        <a routerLink="/ngrx-playground">Simulated Playground</a>
        to understand the fundamentals, then come here to see the real implementation!
      </div>
    </div>
  `,
})
export class NgrxRealPlaygroundComponent implements OnInit {
  private store = inject(Store<AppState>);

  // Code example for display
  codeExample = `// Component
export class MyComponent {
  store = inject(Store);

  // Select state using selectors
  products$ = this.store.select(selectAllProducts);
  loading$ = this.store.select(selectProductsLoading);

  // Dispatch actions
  loadProducts() {
    this.store.dispatch(loadProducts());
  }

  addToCart(product: Product) {
    this.store.dispatch(addToCart({
      item: {
        productId: product.id,
        name: product.name,
        price: product.price
      }
    }));
  }
}`;

  // Products selectors
  products$: Observable<Product[]> = this.store.select(selectAllProducts);
  loading$: Observable<boolean> = this.store.select(selectProductsLoading);
  error$: Observable<string | null> = this.store.select(selectProductsError);
  productCount$: Observable<number> = this.store.select(selectProductCount);

  // Cart selectors
  cartItems$: Observable<CartItem[]> = this.store.select(selectCartItems);
  cartTotal$: Observable<number> = this.store.select(selectCartTotal);
  cartItemCount$: Observable<number> = this.store.select(selectCartItemCount);
  isCartEmpty$: Observable<boolean> = this.store.select(selectIsCartEmpty);

  ngOnInit(): void {
    console.log('🏪 Real NgRx Store Playground initialized');
  }

  // Action dispatchers
  onLoadProducts(): void {
    this.store.dispatch(loadProducts());
  }

  onAddToCart(product: Product): void {
    this.store.dispatch(
      addToCart({
        item: {
          productId: product.id,
          name: product.name,
          price: product.price,
        },
      })
    );
  }

  onRemove(productId: number): void {
    this.store.dispatch(removeFromCart({ productId }));
  }

  onIncrement(productId: number): void {
    this.store.dispatch(incrementQuantity({ productId }));
  }

  onDecrement(productId: number): void {
    this.store.dispatch(decrementQuantity({ productId }));
  }

  onClearCart(): void {
    this.store.dispatch(clearCart());
  }
}
