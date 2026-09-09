import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { FileManagerService } from 'app/core/services/file-manager/file-manager.service';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';

@Component({
  selector: 'app-file-upload-dialog',
  templateUrl: './file-upload-dialog.component.html',
  styleUrls: ['./file-upload-dialog.component.css']
})
export class FileUploadDialogComponent implements OnInit {

  status: "initial" | "uploading" | "success" | "fail" = "initial";
  file: File | null = null;

  buttonDisabled = false;

  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    private _translocoService: TranslocoService,
    private _fileManagerService: FileManagerService
  ) {
  }

  ngOnInit() {
  }
  closeDialog(): void {
    this._dialogRef.close({ status: null });
  }

  addOrUpdateDocument(): void {
    if (this.file) {
      const formData: FormData = new FormData();
      formData.append('file', this.file, this.file.name);
      formData.append('fileName', this.file.name);
      formData.append('size', this.file.size.toString());

      this._fileManagerService
        .createFileManager(formData)
        .subscribe(
          (response) => {
            if (response.isSuccessful) {
              this.showSweetAlert('success');
              this._dialogRef.close({
                status: true,
              });
            } else {
              this.showSweetAlert('error');
            }
          },
          (err) => {
            console.log(err);
          }
        );

    }

  }

  onChange(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.status = "initial";
      this.file = file;
    }
  }


  showSweetAlert(type: string): void {
    if (type === 'success') {
      const sweetAlertDto = new SweetAlertDto(
        this.translate('sweetalert.success'),
        this.translate('sweetalert.transactionSuccessful'),
        SweetalertType.success
      );
      GeneralService.sweetAlert(sweetAlertDto);
    } else {
      const sweetAlertDto = new SweetAlertDto(
        this.translate('sweetalert.error'),
        this.translate('sweetalert.transactionFailed'),
        SweetalertType.error
      );
      GeneralService.sweetAlert(sweetAlertDto);
    }
  }

  translate(key: string): any {
    return this._translocoService.translate(key);
  }


}
