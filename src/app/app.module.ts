import {CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ProductCategoryMenuComponent} from './components/product-category-menu/product-category-menu.component'
import {ProductService} from './services/product.service';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {LoginComponent} from './components/login/login.component';
import {SearchComponent} from './components/search/search.component';
import {MembersPageComponent} from './components/members-page/members-page.component';
import {MaterialModule} from './material.module'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {provideHttpClient, withInterceptorsFromDi} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {CommonModule} from "@angular/common";

@NgModule({ declarations: [
        SearchComponent,
        MembersPageComponent

    ],
    bootstrap: [],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule
  ],
    providers: [
        AuthService,
        ProductService,
        FormsModule,
        FormsModule,
        ReactiveFormsModule,
        provideHttpClient(withInterceptorsFromDi())
    ],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]})
export class AppModule { }
