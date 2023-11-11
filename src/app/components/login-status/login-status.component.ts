import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { OktaAuthStateService, OKTA_AUTH } from '@okta/okta-angular';
import { AuthState, OktaAuth } from '@okta/okta-auth-js';
import { filter, map, Observable } from 'rxjs';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css']
})
export class LoginStatusComponent implements OnInit {

  userFullName$!: Observable<string>;

  storage: Storage = sessionStorage;
  isAuthenticated$!: Observable<boolean>;

  constructor(
    private _router: Router, 
    private _oktaStateService: OktaAuthStateService, 
    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth) { }

  ngOnInit(): void {

    // Subscribe to authentication state changes
    this.isAuthenticated$! = this._oktaStateService.authState$
    .pipe(
      filter((s: AuthState) => !!s),
      map((s: AuthState) => s.isAuthenticated ?? false)
      );
  }

  // getUserDetails() {
  //   this._oktaStateService.authState$.pipe(
  //     filter((authState: AuthState) => !!authState && !!authState.isAuthenticated),
  //     map((authState: AuthState) => this.storage.setItem('userEmail', JSON.stringify(authState.idToken?.claims.email ?? '')))
  //   )
  // }

  public async signIn() : Promise<void> {
    await this.oktaAuth.signInWithRedirect();
  }

  public async signOut(): Promise<void> {
    await this.oktaAuth.signOut();
  }
}
