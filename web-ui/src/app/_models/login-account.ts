
export class LoginAccount {
  username: string;
  token: string;
  // TODO include "me" information.

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
  }
}
