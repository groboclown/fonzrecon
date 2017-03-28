
import { User } from './user';

export class LoginAccount {
  // These should be read-only except by the me service.
  username: string;
  token: string;
  isAdmin: boolean;
  hasPendingVerification: boolean;
  user: User = new User();

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
    this.hasPendingVerification = false;
  }
}
