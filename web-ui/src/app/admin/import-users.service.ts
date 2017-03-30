import {
  Component, OnInit, Injectable
} from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ApiService } from '../_services/index';

@Injectable()
export class ImportUsersService {

  constructor(
    private api: ApiService
  ) {}

  sendFile(file: File): Observable<Response> {
    return this.api.postFile('/api/v1/users/batch-import', file, 'csvUsers')
      .map((response: Response) => response.json());
  }

  uploadCsvFile() {
    // Do nothing?
  }
}
