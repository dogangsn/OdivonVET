import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslocoService } from '@ngneat/transloco';
import { GeneralService } from 'app/core/services/general/general.service';
import { LogService } from 'app/core/services/logs/logService.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';

@Component({
  selector: 'app-log-view',
  templateUrl: './log-view.component.html',
  styleUrls: ['./log-view.component.css']
})
export class LogViewComponent implements OnInit {

  displayedColumns: string[] = [
    'id',
    'date',
    'oldValue',
    'newValue',
    'fieldName'
  ];
  @ViewChild('paginator') paginator: MatPaginator;

  masterId: string = "";
  logs: any[] = [];

  dataSource = new MatTableDataSource<any>(this.logs);

  constructor(
    private _formBuilder: FormBuilder,
    private _dialogRef: MatDialogRef<any>,
    private _translocoService: TranslocoService,
    private _logService: LogService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.masterId = data.masterId;
  }

  ngOnInit() {
    this.getLogs();
  }

  getLogs() {
    const model = { masterId: this.masterId };
    this._logService.getLogs(model).subscribe(resp => {
      if (resp.isSuccessful) {
        this.logs = resp.data;
        this.dataSource = new MatTableDataSource<any>(
          this.logs
        );
        this.dataSource.paginator = this.paginator;
      }
    }, (err) => {

    });
  }

  closeDialog(): void {
    this._dialogRef.close({ status: null });
  }

  showSweetAlert(type: string, text: string): void {
    if (type === 'success') {
      const sweetAlertDto = new SweetAlertDto(
        this.translate('sweetalert.success'),
        this.translate(text),
        SweetalertType.success
      );
      GeneralService.sweetAlert(sweetAlertDto);
    } else {
      const sweetAlertDto = new SweetAlertDto(
        this.translate('sweetalert.error'),
        this.translate(text),
        SweetalertType.error
      );
      GeneralService.sweetAlert(sweetAlertDto);
    }
  }

  translate(key: string): any {
    return this._translocoService.translate(key);
  }

  formatDate(date: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(date).toLocaleString('tr-TR', options);
  }


}
