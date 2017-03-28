import { Injectable, Inject } from '@angular/core';
import { LoginAccount } from '../_models/login-account';

// FIXME make this a parameter.
const BASE_URL = 'http://localhost:3000';

/**
 * Simple service for maintaining the logged-in user and the related
 * information for that user.
 */
@Injectable()
export class MeService {
  private loginAccount: LoginAccount;

  constructor() {
    this.loginAccount = new LoginAccount();
  }

  /**
   * TODO return the user data stored in the login account.
   */
  userData(): LoginAccount {
    return this.loginAccount;
  }

  isAuthenticated(): boolean {
    return this.loginAccount.isAuthenticated();
  }

  /**
   * Low-level API for setting up the user data when the user is
   * logged in.
   */
  onLogin(loginData: any) {
    this.loginAccount.loggedIn(loginData.username, loginData.token);
  }

  onLogout() {
    this.loginAccount.loggedOut();
  }
}
