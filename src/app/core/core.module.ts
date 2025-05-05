// We need a factory since localStorage is not available at AOT build time
import {AuthConfig, OAuthModule, OAuthModuleConfig, OAuthStorage} from "angular-oauth2-oidc";
import {inject, ModuleWithProviders, NgModule, Optional, SkipSelf, provideAppInitializer } from "@angular/core";
import {AuthService} from "./auth.service";
import {AuthGuard} from "./auth-guard.service";
import {AuthGuardWithForcedLogin} from "./auth-guard-with-forced-login.service";
import {provideHttpClient, withInterceptorsFromDi} from "@angular/common/http";
import {authAppInitializerFactory} from "./auth-app-initializer.factory";
import {authModuleConfig} from "./auth-module-config";
import {googleAuthConfig} from "./google-auth-config";

export function storageFactory(): OAuthStorage {
  return localStorage;
}

@NgModule({
  imports: [OAuthModule.forRoot()], providers: [
    AuthService,
    AuthGuard,
    AuthGuardWithForcedLogin,
    provideHttpClient(withInterceptorsFromDi()),
  ]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        provideAppInitializer(() => {
          const initializerFn = (authAppInitializerFactory)(inject(AuthService));
          return initializerFn();
        }),
        { provide: AuthConfig, useValue: googleAuthConfig },
        { provide: OAuthModuleConfig, useValue: authModuleConfig },
        { provide: OAuthStorage, useFactory: storageFactory },
      ]
    };
  }

  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
