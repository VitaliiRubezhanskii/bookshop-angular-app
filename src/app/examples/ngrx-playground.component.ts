import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Subject, Observable, Subscription } from 'rxjs';
import { scan, map, distinctUntilChanged, filter } from 'rxjs/operators';

/**
 * NgRx Simulated Playground
 *
 * This demonstrates NgRx concepts using plain RxJS - no @ngrx packages needed!
 * Shows how NgRx works under the hood.
 *
 * Navigate to: /ngrx-playground
 */

// ============================================================
// SIMULATED NGRX IMPLEMENTATION (Educational)
// ============================================================

// --- ACTIONS ---
interface Action {
  type: string;
  payload?: any;
}

// Action creators (like createAction in NgRx)
const createAction = (type: string) => (payload?: any): Action => ({ type, payload });

// Product actions
const ProductActions = {
  load: createAction('[Products] Load'),
  loadSuccess: createAction('[Products] Load Success'),
  loadFailure: createAction('[Products] Load Failure'),
};

// Cart actions
const CartActions = {
  addItem: createAction('[Cart] Add Item'),
  removeItem: createAction('[Cart] Remove Item'),
  updateQuantity: createAction('[Cart] Update Quantity'),
  clear: createAction('[Cart] Clear'),
};

// --- STATE ---
interface Product {
  id: number;
  name: string;
  price: number;
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

interface AppState {
  products: {
    items: Product[];
    loading: boolean;
    error: string | null;
  };
  cart: {
    items: CartItem[];
  };
}

const initialState: AppState = {
  products: {
    items: [],
    loading: false,
    error: null,
  },
  cart: {
    items: [],
  },
};

// --- REDUCER ---
function rootReducer(state: AppState, action: Action): AppState {
  console.log('📦 Reducer received:', action.type, action.payload);

  switch (action.type) {
    // Products
    case '[Products] Load':
      return {
        ...state,
        products: { ...state.products, loading: true, error: null },
      };

    case '[Products] Load Success':
      return {
        ...state,
        products: { ...state.products, items: action.payload, loading: false },
      };

    case '[Products] Load Failure':
      return {
        ...state,
        products: { ...state.products, loading: false, error: action.payload },
      };

    // Cart
    case '[Cart] Add Item':
      const existingItem = state.cart.items.find(
        (item) => item.productId === action.payload.productId
      );
      if (existingItem) {
        return {
          ...state,
          cart: {
            items: state.cart.items.map((item) =>
              item.productId === action.payload.productId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          },
        };
      }
      return {
        ...state,
        cart: {
          items: [...state.cart.items, { ...action.payload, quantity: 1 }],
        },
      };

    case '[Cart] Remove Item':
      return {
        ...state,
        cart: {
          items: state.cart.items.filter(
            (item) => item.productId !== action.payload
          ),
        },
      };

    case '[Cart] Update Quantity':
      return {
        ...state,
        cart: {
          items: state.cart.items.map((item) =>
            item.productId === action.payload.productId
              ? { ...item, quantity: action.payload.quantity }
              : item
          ),
        },
      };

    case '[Cart] Clear':
      return {
        ...state,
        cart: { items: [] },
      };

    default:
      return state;
  }
}

// --- SIMULATED STORE ---
class SimulatedStore {
  private state$ = new BehaviorSubject<AppState>(initialState);
  private actions$ = new Subject<Action>();
  private actionLog: Action[] = [];

  constructor() {
    // Process actions through reducer
    this.actions$
      .pipe(scan((state, action) => rootReducer(state, action), initialState))
      .subscribe((newState) => this.state$.next(newState));
  }

  // Dispatch action
  dispatch(action: Action): void {
    this.actionLog.push(action);
    this.actions$.next(action);
  }

  // Select state (like store.select in NgRx)
  select<T>(selector: (state: AppState) => T): Observable<T> {
    return this.state$.pipe(
      map(selector),
      distinctUntilChanged()
    );
  }

  // Get current state snapshot
  getState(): AppState {
    return this.state$.getValue();
  }

  // Get action history (for debugging)
  getActionLog(): Action[] {
    return this.actionLog;
  }
}

// --- SELECTORS ---
const selectProducts = (state: AppState) => state.products.items;
const selectProductsLoading = (state: AppState) => state.products.loading;
const selectProductsError = (state: AppState) => state.products.error;
const selectCartItems = (state: AppState) => state.cart.items;
const selectCartTotal = (state: AppState) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
const selectCartItemCount = (state: AppState) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

// ============================================================
// COMPONENT
// ============================================================

@Component({
  selector: 'app-ngrx-playground',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 20px; font-family: monospace; max-width: 1200px; margin: 0 auto;">
      <h1>NgRx Simulated Playground</h1>
      <p>This demonstrates NgRx patterns using plain RxJS - no packages needed!</p>
      <p style="color: #666;">Open console (F12) to see action dispatches.</p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">

        <!-- LEFT COLUMN: Products & Actions -->
        <div>
          <h2>📦 Products (State)</h2>

          <!-- Load Products -->
          <div style="margin-bottom: 15px;">
            <button (click)="loadProducts()" [disabled]="loading">
              {{ loading ? 'Loading...' : 'Load Products' }}
            </button>
            <button (click)="loadProductsWithError()" style="margin-left: 10px;">
              Simulate Error
            </button>
          </div>

          <!-- Error display -->
          <div *ngIf="error" style="color: red; margin-bottom: 10px;">
            Error: {{ error }}
          </div>

          <!-- Products list -->
          <div *ngIf="products.length > 0" style="background: #f5f5f5; padding: 10px; border-radius: 5px;">
            <div *ngFor="let product of products"
                 style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #ddd;">
              <span>{{ product.name }} - \${{ product.price }}</span>
              <button (click)="addToCart(product)">Add to Cart</button>
            </div>
          </div>

          <div *ngIf="products.length === 0 && !loading" style="color: #999;">
            Click "Load Products" to fetch products
          </div>

          <hr style="margin: 20px 0;">

          <!-- Action Log -->
          <h2>📋 Action Log</h2>
          <div style="background: #1e1e1e; color: #0f0; padding: 10px; height: 200px; overflow-y: auto; font-size: 12px;">
            <div *ngFor="let action of actionLog; let i = index">
              {{ i + 1 }}. {{ action.type }}
              <span *ngIf="action.payload" style="color: #888;">
                {{ action.payload | json }}
              </span>
            </div>
            <div *ngIf="actionLog.length === 0" style="color: #666;">
              No actions dispatched yet...
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Cart & State -->
        <div>
          <h2>🛒 Cart (Derived State)</h2>

          <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <div style="font-size: 18px; font-weight: bold;">
              Items: {{ cartItemCount }} | Total: \${{ cartTotal.toFixed(2) }}
            </div>
          </div>

          <!-- Cart items -->
          <div *ngIf="cartItems.length > 0">
            <div *ngFor="let item of cartItems"
                 style="display: flex; justify-content: space-between; align-items: center;
                        padding: 10px; background: #fff; margin-bottom: 5px; border: 1px solid #ddd; border-radius: 3px;">
              <div>
                <strong>{{ item.name }}</strong><br>
                <small>\${{ item.price }} x {{ item.quantity }}</small>
              </div>
              <div>
                <button (click)="updateQuantity(item.productId, item.quantity - 1)"
                        [disabled]="item.quantity <= 1">-</button>
                <span style="margin: 0 10px;">{{ item.quantity }}</span>
                <button (click)="updateQuantity(item.productId, item.quantity + 1)">+</button>
                <button (click)="removeFromCart(item.productId)" style="margin-left: 10px; color: red;">×</button>
              </div>
            </div>
            <button (click)="clearCart()" style="margin-top: 10px; background: #f44336; color: white; border: none; padding: 8px 16px;">
              Clear Cart
            </button>
          </div>

          <div *ngIf="cartItems.length === 0" style="color: #999;">
            Cart is empty
          </div>

          <hr style="margin: 20px 0;">

          <!-- Current State -->
          <h2>🔍 Current State (DevTools View)</h2>
          <pre style="background: #263238; color: #aed581; padding: 10px; overflow: auto; max-height: 300px; font-size: 11px;">{{ currentState | json }}</pre>
        </div>
      </div>

      <hr style="margin: 30px 0;">

      <!-- How It Works -->
      <h2>📖 How This Works</h2>
      <div style="background: #fff3e0; padding: 15px; border-radius: 5px;">
        <pre style="margin: 0; white-space: pre-wrap;">
1. ACTIONS are dispatched: store.dispatch(CartActions.addItem(product))

2. REDUCER receives action and returns NEW state (never mutates!)

3. SELECTORS query the state: store.select(selectCartTotal)

4. COMPONENTS subscribe to selectors and re-render on changes

Flow: Component → dispatch(Action) → Reducer → New State → Selector → Component
        </pre>
      </div>

      <!-- Pattern Comparison -->
      <h3 style="margin-top: 20px;">Real NgRx vs This Simulation</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #f5f5f5;">
          <th style="padding: 10px; border: 1px solid #ddd;">Concept</th>
          <th style="padding: 10px; border: 1px solid #ddd;">This Simulation</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Real NgRx</th>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Actions</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Plain objects</td>
          <td style="padding: 10px; border: 1px solid #ddd;">createAction()</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Reducer</td>
          <td style="padding: 10px; border: 1px solid #ddd;">switch/case function</td>
          <td style="padding: 10px; border: 1px solid #ddd;">createReducer() with on()</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Selectors</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Simple functions</td>
          <td style="padding: 10px; border: 1px solid #ddd;">createSelector() (memoized)</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Store</td>
          <td style="padding: 10px; border: 1px solid #ddd;">BehaviorSubject + scan</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Store service (DI)</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Effects</td>
          <td style="padding: 10px; border: 1px solid #ddd;">setTimeout simulation</td>
          <td style="padding: 10px; border: 1px solid #ddd;">createEffect() + Actions observable</td>
        </tr>
      </table>
    </div>
  `,
})
export class NgrxPlaygroundComponent implements OnInit, OnDestroy {
  private store = new SimulatedStore();
  private subscriptions: Subscription[] = [];

  // State from selectors
  products: Product[] = [];
  loading = false;
  error: string | null = null;
  cartItems: CartItem[] = [];
  cartTotal = 0;
  cartItemCount = 0;
  actionLog: Action[] = [];
  currentState: AppState = initialState;

  ngOnInit(): void {
    // Subscribe to selectors (like async pipe in template)
    this.subscriptions.push(
      this.store.select(selectProducts).subscribe((p) => (this.products = p)),
      this.store.select(selectProductsLoading).subscribe((l) => (this.loading = l)),
      this.store.select(selectProductsError).subscribe((e) => (this.error = e)),
      this.store.select(selectCartItems).subscribe((items) => (this.cartItems = items)),
      this.store.select(selectCartTotal).subscribe((t) => (this.cartTotal = t)),
      this.store.select(selectCartItemCount).subscribe((c) => (this.cartItemCount = c))
    );

    // Update action log and state display
    setInterval(() => {
      this.actionLog = this.store.getActionLog();
      this.currentState = this.store.getState();
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // --- SIMULATED EFFECTS (API calls) ---

  loadProducts(): void {
    // Dispatch load action
    this.store.dispatch(ProductActions.load());

    // Simulate API call (this would be an Effect in real NgRx)
    setTimeout(() => {
      const mockProducts: Product[] = [
        { id: 1, name: 'Angular Book', price: 29.99 },
        { id: 2, name: 'RxJS Guide', price: 24.99 },
        { id: 3, name: 'NgRx Patterns', price: 34.99 },
        { id: 4, name: 'TypeScript Handbook', price: 19.99 },
      ];
      this.store.dispatch(ProductActions.loadSuccess(mockProducts));
    }, 1000);
  }

  loadProductsWithError(): void {
    this.store.dispatch(ProductActions.load());

    setTimeout(() => {
      this.store.dispatch(ProductActions.loadFailure('Network error: Failed to fetch products'));
    }, 1000);
  }

  // --- CART ACTIONS ---

  addToCart(product: Product): void {
    this.store.dispatch(
      CartActions.addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
      })
    );
  }

  removeFromCart(productId: number): void {
    this.store.dispatch(CartActions.removeItem(productId));
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity > 0) {
      this.store.dispatch(CartActions.updateQuantity({ productId, quantity }));
    }
  }

  clearCart(): void {
    this.store.dispatch(CartActions.clear());
  }
}
