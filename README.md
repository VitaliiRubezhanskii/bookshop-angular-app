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
