import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export class AlertMessage {
  isError: boolean;
  isMessage: boolean;
  text: string;
}

export class AlertStatus {
  private subject = new Subject<AlertMessage>();

  success(message: string) {
      this.subject.next({ isError: false, isMessage: true, text: message });
  }

  error(message: string) {
      this.subject.next({ isError: true, isMessage: false, text: message });
  }

  onMessageEvent(): Observable<AlertMessage> {
    return this.subject.asObservable();
  }
}
