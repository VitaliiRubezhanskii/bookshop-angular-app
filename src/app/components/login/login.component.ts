import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from "../../auth.service";

@Component({
  selector: 'app-user-login',
  templateUrl: './login.component.html',
  styleUrls: ['login.component.css'],
  standalone: true
})
export class LoginComponent {
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);

  async onGoogleSignIn(): Promise<void> {
    try {
      await this.authService.googleLogin();
      await this.router.navigateByUrl('/products');
    } catch (error) {
      console.error('Google Sign-In error:', error);
    }
  }
}
