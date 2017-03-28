import { Injectable, Inject } from '@angular/core';
import { LoginAccount } from '../_models/login-account';
import { User } from '../_models/user';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { createObservableFor } from './lib/index';

const LOCAL_STORAGE_KEY = 'FonzKey_login1';



/**
 * Simple service for maintaining the logged-in user and the related
 * information for that user.
 */
@Injectable()
export class MeService {
  private storage;
  private subject: Subject<LoginAccount> = new Subject();
  private loginAccount: LoginAccount = new LoginAccount();
  private loadMeSubject: Subject<LoginAccount> = new Subject();
  private initialized = false;

  constructor() {
    this.storage = localStorage;
  }

  /**
   * TODO return the user data stored in the login account.
   */
  getLoginAccountSync(): LoginAccount {
    return this.loginAccount;
  }

  getLoginAccount(): Observable<LoginAccount> {
    if (!this.initialized) {
      console.log(`DEBUG first get account call`);
      this.initialized = true;
      return this.localGet();
    }
    return this.subject.asObservable();
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

  /**
   * Low-level API for setting up the user data when the user is
   * logged in.
   */
  onLogin(loginData: any) {
    console.log(`DEBUG logged in with data`);
    if (loginData) {
      this.loginAccount.loggedIn(loginData.username, loginData.token);
    }
    if (this.localSave()) {
      this.loadMeSubject.next(this.loginAccount);
    }
  }

  getLowLevelLogin(): Observable<LoginAccount> {
    return this.loadMeSubject.asObservable();
  }

  onAboutMe(aboutMeData: any) {
    console.log(`DEBUG loading me data from server`);
    this.loginAccount.isAdmin = aboutMeData.isAdmin || false;
    this.loginAccount.hasPendingVerification = aboutMeData.hasPendingVerification || false;
    if (aboutMeData.User) {
      this.loginAccount.user = User.parseFromJson(aboutMeData.User);
    }
    this.subject.next(this.loginAccount);
  }

  onLogout() {
    this.loginAccount.loggedOut();
    this.localSave();
    this.subject.next(this.loginAccount);
  }

  private localSave() {
    if (this.storage && this.loginAccount) {
      this.storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        username: this.loginAccount.username,
        token: this.loginAccount.token
      }));
    }
  }

  private localGet(): Observable<LoginAccount> {
    if (this.storage) {
      const value = this.storage.getItem(LOCAL_STORAGE_KEY);
      if (value) {
        try {
          const data = JSON.parse(value);
          if (data && data.username && data.token) {
            this.loginAccount.loggedIn(data.username, data.token);
            this.loadMeSubject.next(this.loginAccount);
          }
        } catch (e) {
          // ignore
        }
      }
    }
    return this.subject.asObservable();
  }
}
