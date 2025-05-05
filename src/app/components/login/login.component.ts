import {Component} from "@angular/core";
import {OAuthService} from "angular-oauth2-oidc";

@Component({
  selector: 'app-should-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent {
  constructor(private authService: OAuthService) { }

  public login($event: any) {
    $event.preventDefault();
    this.authService.initLoginFlow();
  }
}
