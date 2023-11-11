import { Component, Inject, OnInit } from '@angular/core';
import { OktaAuth } from '@okta/okta-auth-js';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaSignIn } from '@okta/okta-signin-widget';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  oktaSignin: any;
  user;
  oktaSignIn: OktaSignIn;

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth, private changeDetectorRef: ChangeDetectorRef) { 

    this.oktaSignin = new OktaSignIn({
      baseUrl: 'https://dev-06911339.okta.com',
      clientId: '0oa9qiqtd3dKHCRNa5d7',
      redirectUri: 'https://localhost:4200'
    });

  }

  async ngOnInit() {
    try {
      this.user = await this.oktaSignIn.authClient.token.getUserInfo();
    } catch (error) {
      this.showLogin();
    }
  }
 
  showLogin(): void {
    this.oktaSignIn.renderEl({el: '#okta-login-container'}, (response) => {
      if (response.status === 'SUCCESS') {
        // this.user = response.tokens.idToken.claims.email;
        // this.oktaSignIn.remove();
        // this.changeDetectorRef.detectChanges();
      }
    });
  }

  logout(): void {
    // this.oktaSignIn.authClient.signOut(() => {
    //   this.user = undefined;
    //   this.showLogin();
    // });
  }

}
