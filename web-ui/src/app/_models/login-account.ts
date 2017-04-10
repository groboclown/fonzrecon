
import { User } from './user';

export class LoginAccount {
  // These should be read-only except by the me service.
  username: string;
  token: string;
  isAdmin: boolean;
  canValidateClaims: boolean;
  hasPendingVerification: boolean;
  user: User = new User();

  primaryName(): string {
    if (this.user) {
      return this.user.primaryName;
    }
    return this.username;
  }

  isAuthenticated() {
    return this.username != null && this.token != null;
  }

  loggedIn(username: string, token: string) {
    this.username = username;
    this.token = token;
  }

  loggedOut() {
    this.username = null;
    this.token = null;
    this.user = new User();
    this.isAdmin = false;
    this.canValidateClaims = false;
    this.hasPendingVerification = false;
  }
}
