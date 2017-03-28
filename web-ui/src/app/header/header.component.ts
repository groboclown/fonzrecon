import { Component, OnInit } from '@angular/core';

import { ApiService } from '../_services/index';

@Component({
    moduleId: module.id,
    selector: 'app-header',
    templateUrl: 'header.component.html'
})
export class HeaderComponent implements OnInit {

    constructor(private apiService: ApiService) { }

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
