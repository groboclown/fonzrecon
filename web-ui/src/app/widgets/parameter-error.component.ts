import { Component, OnInit, Input } from '@angular/core';

import { AlertMessage, AlertStatus } from './alert.model';

@Component({
    moduleId: module.id,
    selector: 'app-param-error',
    templateUrl: 'parameter-error.component.html',
    styleUrls: ['./parameter-error.component.css']
})
export class ParameterErrorComponent implements OnInit {
  isError = false;
  message: string;
  @Input() status: AlertStatus;
  @Input() param: string;

  ngOnInit() {
    this.status.onMessageEvent().subscribe((message: AlertMessage) => {
      if (this.param && message && message.parameters[this.param]) {
        this.isError = true;
        this.message = message.parameters[this.param].msg ||
          message.parameters[this.param].description;
      } else {
        this.clearMessage();
      }
    });
  }

  clearMessage() {
    this.isError = false;
    this.message = null;
  }
}
