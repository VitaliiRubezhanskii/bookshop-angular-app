import { OAuthModuleConfig } from 'angular-oauth2-oidc';
import {Injectable} from "@angular/core";
import {AuthService} from "./auth.service";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {Observable, tap} from "rxjs";

@Injectable()
export class AuthGuard {
  constructor(
    private authService: AuthService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot,): Observable<boolean> {
    return this.authService.canActivateProtectedRoutes$
      .pipe(tap(x => console.log('You tried to go to ' + state.url + ' and this guard said ' + x)));
  }
}
