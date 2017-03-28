import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

export function createObservableFor<T>(data: T, cleanup: Function = null): Observable<T> {
  return Observable.create(observer => {
    // Yield a single value and complete
    observer.onNext(data);
    observer.onCompleted();

    // Any cleanup logic might go here
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  });
}
