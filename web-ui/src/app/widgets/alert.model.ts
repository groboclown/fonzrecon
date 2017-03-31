import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export class AlertMessage {
  isError: boolean;
  isMessage: boolean;
  text: string;
  parameters: any = {};
}

export class AlertStatus {
  private subject = new Subject<AlertMessage>();

  success(message: string) {
    this.subject.next({
      isError: false,
      isMessage: true,
      text: message,
      parameters: {}
    });
  }

  error(err: any) {
    const params = {};
    let msg;
    if (err instanceof Response) {
      const data = err.json();
      console.log(`DEBUG error data ${JSON.stringify(data)}`);
      if (data) {
        msg = '';
        if (data.msg) {
          msg = data.msg;
        } else if (data.message === 'ValidationError') {
          msg = 'Validation Error';
        } else if (data.message) {
          msg = data.message;
        }
        console.log(`DEBUG partial message: [${msg}]`);
        if (data.details && data.details.length) {
          for (let i = 0; i < data.details.length; i++) {
            params[data.details[i].param] = data.details[i];
          }
        }
      } else {
        msg = err.statusText;
      }
    } else if (err.message) {
      msg = err.message;
    } else {
      msg = '' + err;
    }
    console.log(`DEBUG set message to [${msg}]`);
    this.subject.next({ isError: true, isMessage: false, text: msg, parameters: params });
  }

  onMessageEvent(): Observable<AlertMessage> {
    return this.subject.asObservable();
  }
}
