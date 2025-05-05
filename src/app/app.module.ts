import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {ProductCategoryMenuComponent} from './components/product-category-menu/product-category-menu.component'
import {ProductListComponent} from './components/product-list/product-list.component';
import {ProductService} from './services/product.service';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {LoginComponent} from './components/login/login.component';
import {CheckoutComponent} from './components/checkout/checkout.component';
import {LoginStatusComponent} from './components/login-status/login-status.component';
import {SearchComponent} from './components/search/search.component';
import {CartStatusComponent} from './components/cart-status/cart-status.component';
import {CartDetailsComponent} from './components/cart-details/cart-details.component';
import {ProductDetailsComponent} from './components/product-details/product-details.component';
import {MembersPageComponent} from './components/members-page/members-page.component';
import {OrderHistoryComponent} from './components/order-history/order-history.component';
// import { AuthInterceptorService } from './services/auth-interceptor.service';
import {MaterialModule} from './material.module'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CreditCardFormComponent} from "./components/credit-card-form/credit-card-form.component";
import {AddressFormComponent} from "./components/address-form/address-form.component";
import {OAuthModule} from "angular-oauth2-oidc";
import {AuthService} from "./core/auth.service";
import {AuthGuard} from "./core/auth-guard.service";
import {AuthGuardWithForcedLogin} from "./core/auth-guard-with-forced-login.service";
import {CoreModule} from "./core/core.module";

// const oktaConfig = Object.assign({
//   onAuthRequired: (oktaAuth, injector) => {
//     const router = injector.get(Router);
//
//     // Redirect the user to your custom login page
//     router.navigate(['/login']);
//   }
// }, myAppConfig.oidc);
// const oktaAuth = new OktaAuth({
//   clientId: '0oa9qiqtd3dKHCRNa5d7',
//   issuer: 'https://dev-06911339.okta.com',
//   redirectUri: 'https://localhost:4200/login/callback'
// });

@NgModule({
  declarations: [
    AppComponent,
    ProductListComponent,
    ProductCategoryMenuComponent,
    SearchComponent,
    ProductDetailsComponent,
    CartStatusComponent,
    CartDetailsComponent,
    CheckoutComponent,
    LoginComponent,
    LoginStatusComponent,
    MembersPageComponent,
    OrderHistoryComponent,
    CreditCardFormComponent,
    AddressFormComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    NgbModule,
    ReactiveFormsModule,
    AppRoutingModule,
    FormsModule,
    CoreModule.forRoot(),
  ],

  providers: [
    ProductService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
