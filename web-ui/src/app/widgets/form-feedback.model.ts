
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';


export class ParameterError {
  key: string;
  message: string;
}


export class FormFeedbackError {
  parameters: ParameterError[];
  message: string;
}

export class FormFeedbackResult<T> {
  value: T;
  message: string;
}


export class FormFeedbackStatus<T> {
  private errorSubject = new Subject<FormFeedbackError>();
  private resultSubject = new Subject<FormFeedbackResult<T>>();
  private clearSubject = new Subject<boolean>();

  // Package protected...
  _onClearSent(): Observable<boolean> {
    return this.clearSubject.asObservable();
  }

  _onErrorSent(): Observable<FormFeedbackError> {
    return this.errorSubject.asObservable();
  }

  _onSuccessSent(): Observable<FormFeedbackResult<T>> {
    return this.resultSubject.asObservable();
  }

  // Public ...


  clear(): void {
    this.clearSubject.next(true);
  }

  success(t: T, message?: string): void {
    this.resultSubject.next({ value: t, message: message || null });
  }

  error(err): void {
    const params: ParameterError[] = [];
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
            params.push({
              key: data.details[i].param,
              message: data.details[i].msg || data.details[i].description
            });
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
    this.errorSubject.next({ message: msg, parameters: params });
  }
}
