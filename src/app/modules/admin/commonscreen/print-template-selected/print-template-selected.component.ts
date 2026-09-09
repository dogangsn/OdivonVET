import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { GeneralService } from 'app/core/services/general/general.service';
import { LogService } from 'app/core/services/logs/logService.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { PrintType } from '../../definition/printtemplate/models/printType.enum';
import { PrintTemplateService } from 'app/core/services/definition/printtemplate/printtemplate.service';
import { PrintTemplateListDto } from '../../definition/printtemplate/models/printtemplatelistdto';

@Component({
  selector: 'app-print-template-selected',
  templateUrl: './print-template-selected.component.html',
  styleUrls: ['./print-template-selected.component.css']
})
export class PrintTemplateSelectedComponent implements OnInit {

  printType: PrintType;
  printtemplate: PrintTemplateListDto[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _dialogRef: MatDialogRef<any>,
    private _translocoService: TranslocoService,
    private _logService: LogService,
    private _printtemplate: PrintTemplateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.printType = data.printType;
  }

  ngOnInit() {
    if (this.printType) {
      this.getPrintTemplateList(this.printType);
    }
  }

  getPrintTemplateList(type: PrintType): void {
    const item = {
      type : type
    }
    this._printtemplate.getPrintTemplateFilterByType(item).subscribe((response) => {
      this.printtemplate = response.data;
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

}
