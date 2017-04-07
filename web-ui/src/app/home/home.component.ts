import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Component({
    moduleId: module.id,
    templateUrl: 'home.component.html',
    styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  listChangeSubject = new Subject<any>();
  showCreateAaay = false;

  toggleCreateAaay() {
    this.showCreateAaay = !this.showCreateAaay;
  }
}
