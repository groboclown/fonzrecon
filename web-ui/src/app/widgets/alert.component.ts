import { Component, OnInit, Input } from '@angular/core';

import { AlertMessage, AlertStatus } from './alert.model';

// DEPRECATED use form-feedback instead.
@Component({
    moduleId: module.id,
    selector: 'app-alert',
    templateUrl: 'alert.component.html',
    styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {
  message: AlertMessage = new AlertMessage();
  @Input() status: AlertStatus;

  ngOnInit() {
    this.status.onMessageEvent().subscribe((message: AlertMessage) => {
      this.message = message || new AlertMessage();
    });
  }

  clearMessage() {
    this.message = new AlertMessage();
  }
}
