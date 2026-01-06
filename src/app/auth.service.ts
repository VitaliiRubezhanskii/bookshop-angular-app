import {Injectable} from '@angular/core';
import {
  Auth,
  browserSessionPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  user,
  User,
} from '@angular/fire/auth';
import {setPersistence} from 'firebase/auth';
import {from, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(private firebaseAuth: Auth) {
    this.setSessionStoragePersistence();
    this.user$ = user(this.firebaseAuth);
  }

  private setSessionStoragePersistence(): void {
    setPersistence(this.firebaseAuth, browserSessionPersistence).catch(err =>
      console.error('Failed to set session persistence:', err)
    );
  }

  async googleLogin(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.firebaseAuth, provider);
    console.log("User data: = " + JSON.stringify(result.user))
    if (!result.user) {
      throw new Error('Google login failed');
    }
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth).then(() => sessionStorage.clear());
    return from(promise);
  }
}
