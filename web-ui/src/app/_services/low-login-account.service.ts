import { Injectable, Inject } from '@angular/core';
import { LoginAccount } from '../_models/login-account';
import { User } from '../_models/user';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const LOCAL_STORAGE_KEY = 'FonzKey_login1';



/**
 * Low-level account access for separating out concerns for login
 * and user fetching.
 */
@Injectable()
export class LowLoginAccountService {
  private storage;
  private loginAccount: LoginAccount = new LoginAccount();
  // use behavior subject because it immediately calls the method
  // on subscribe() with the last value.
  private loadLoginSubject: BehaviorSubject<LoginAccount> = new BehaviorSubject(null);
  private loadMeSubject: BehaviorSubject<LoginAccount> = new BehaviorSubject(null);

  constructor() {
    this.storage = localStorage;
    this.localGet();
  }

  getOnLoginAccountLoaded(): Observable<LoginAccount> {
    return this.loadMeSubject.asObservable();
  }

  getOnSimpleLoginLoaded(): Observable<LoginAccount> {
    return this.loadLoginSubject.asObservable();
  }

  isAuthenticated(): boolean {
    return this.loginAccount && this.loginAccount.isAuthenticated();
  }

  getAuthenticatedToken(): string {
    if (this.loginAccount && this.loginAccount.isAuthenticated()) {
      return this.loginAccount.token;
    }
    return null;
  }

  getLoginAccountSync(): LoginAccount {
    return this.loginAccount;
  }

  /**
   * Low-level API for setting up the user data when the user is
   * logged in.
   */
  withLoginData(loginData: any) {
    console.log(`DEBUG logged in with data`);
    if (loginData) {
      this.loginAccount.loggedIn(loginData.username, loginData.token);
    }
    this.localSave();
    this.loadLoginSubject.next(this.loginAccount);
  }

  withAboutMeData(aboutMeData: any) {
    console.log(`DEBUG loading me data from server`);
    this.loginAccount.isAdmin = aboutMeData.isAdmin || false;
    this.loginAccount.hasPendingVerification = aboutMeData.hasPendingVerification || false;
    if (aboutMeData.User) {
      this.loginAccount.user = User.parseFromJson(aboutMeData.User);
    }
    this.loadMeSubject.next(this.loginAccount);
  }

  onLogout() {
    console.log(`Logging out of server`);
    this.loginAccount.loggedOut();
    this.localSave();
    // loadMe, because the whole object state has changed.
    this.loadMeSubject.next(this.loginAccount);
  }

  private localSave() {
    if (this.storage && this.loginAccount) {
      this.storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        username: this.loginAccount.username,
        token: this.loginAccount.token
      }));
    }
  }

  private localGet(): boolean {
    if (this.storage) {
      const value = this.storage.getItem(LOCAL_STORAGE_KEY);
      if (value) {
        try {
          const data = JSON.parse(value);
          if (data && data.username && data.token) {
            this.withLoginData(data);
            return true;
          }
        } catch (e) {
          // ignore
        }
      }
    }
    return false;
  }
}
