import {Injectable} from "@angular/core";
import {AuthService} from "./auth.service";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {Observable, switchMap, tap} from "rxjs";
import {filter} from "rxjs/operators";

@Injectable()
export class AuthGuardWithForcedLogin {

  constructor(
    private authService: AuthService,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot,): Observable<boolean> {
    return this.authService.isDoneLoading$.pipe(
      filter(isDone => isDone),
      switchMap(_ => this.authService.isAuthenticated$),
      tap(isAuthenticated => isAuthenticated || this.authService.login(state.url))
    );
  }
}
