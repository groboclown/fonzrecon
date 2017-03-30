import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

import { LoginService } from './login.service';

@Component({
    moduleId: module.id,
    templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit {
    model: any = {};
    returnUrl: string;
    loading = false;
    error = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private loginService: LoginService) { }

    ngOnInit() {
      // reset login status
      this.loginService.logout();

      // get return url from route parameters.
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    login() {
        this.loading = true;
        this.loginService.login(this.model.username, this.model.password)
        .subscribe(result => {
          if (result === true) {
            this.router.navigate([this.returnUrl]);
          } else {
            this.model.password = '';
            this.error = 'Username or password is incorrect';
            this.loading = false;
          }
        }, err => {
          this.model.password = '';
          this.error = err.message;
          this.loading = false;
        });
    }
}
