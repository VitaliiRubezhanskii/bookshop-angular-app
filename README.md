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
