import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { ExaminationService } from 'app/core/services/examination/exammination.service';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { ExaminationSalesListDto } from './model/examinationSalesListDto';

@Component({
  selector: 'app-examination-collection',
  templateUrl: './examination-collection.component.html',
  styleUrls: ['./examination-collection.component.css']
})
export class ExaminationCollectionComponent implements OnInit {


  examinationId: string;
  examinationSales: ExaminationSalesListDto[] = [];
  examinationSalesCollection: ExaminationSalesListDto[] = [];

  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    private _translocoService: TranslocoService,
    private _examinationService: ExaminationService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {

    this.examinationId = data.examinationId;

   }


  ngOnInit() {

    this.getExaminationList();

  }

  getExaminationList() {
    const model = {
      examinationId: this.examinationId
    }
    this._examinationService.getExaminationsBySaleList(model).subscribe((response) => {
      this.examinationSales = response.data.filter(x => x.type === 1);
      this.examinationSalesCollection = response.data.filter(x => x.type === 2);
    });
  }

  showSweetAlert(type: string, message: string): void {
    if (type === 'success') {
      const sweetAlertDto = new SweetAlertDto(
        this.translate(message),
        this.translate('sweetalert.transactionSuccessful'),
        SweetalertType.success
      );
      GeneralService.sweetAlert(sweetAlertDto);
    } else {
      const sweetAlertDto = new SweetAlertDto(
        this.translate(message),
        this.translate('sweetalert.transactionFailed'),
        SweetalertType.error
      );
      GeneralService.sweetAlert(sweetAlertDto);
    }
  }

  translate(key: string): any {
    return this._translocoService.translate(key);
  }

  closeDialog(): void {
    this._dialogRef.close({ status: null });
  }


}
