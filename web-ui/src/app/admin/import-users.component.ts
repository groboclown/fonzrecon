import {
  Component, OnInit
} from '@angular/core';
import { Response } from '@angular/http';

import { ImportUsersService } from './import-users.service';
import { AlertStatus } from '../alert/index';

@Component({
    moduleId: module.id,
    templateUrl: 'import-users.component.html',
    styleUrls: ['./import-users.component.css']
})
export class ImportUsersComponent {
  private alertStatus = new AlertStatus();
  private uploadFile: File;
  loading = false;
  userResults: any[] = null;

  constructor(
    private importUsers: ImportUsersService
  ) {}

  fileChange(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.uploadFile = fileList[0];
    }
  }

  uploadCsvFile() {
    if (this.uploadFile) {
      this.importUsers.sendFile(this.uploadFile)
      .subscribe(
        (userResults: any) => {
          this.alertStatus.success('Uploaded.  Check items for individual problems.');
          this.userResults = userResults.results || [];
        },
        (err: any) => {
          if (err instanceof Response) {
            this.alertStatus.error(JSON.stringify(err.json()));
          } else {
            this.alertStatus.error(err.message);
          }
        }
      );
    }
  }

}
