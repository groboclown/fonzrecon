import { Component, OnInit } from '@angular/core';

import { User } from '../_models/index';

@Component({
    moduleId: module.id,
    templateUrl: 'home.component.html'
})
export class HomeComponent implements OnInit {
    users: User[] = [];

    constructor() { }

    ngOnInit() {
        /*
        // get users from secure api end point
        this.userService.getUsers()
            .subscribe(users => {
                this.users = users;
            });
        */
    }

}
