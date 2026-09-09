import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { ProcessTypes, ProcessTypesExit } from '../../models/processTypes.enum';
import { suppliersListDto } from 'app/modules/admin/suppliers/models/suppliersListDto';
import { SuppliersService } from 'app/core/services/suppliers/suppliers.service';

import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { CreateStockTrackingCommand, StockTrackingType } from '../../models/createStockTrackingCommand';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { StockTrackingService } from 'app/core/services/definition/stockTracking/stocktracking.service';
import { UpdateStockTrackingCommand } from '../../models/updateStockTrackingCommand';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'DDD MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'DDD MMMM YYYY',
  },
};


@Component({
  selector: 'app-createedit-stockTracking',
  templateUrl: './createedit-stockTracking.component.html',
  styleUrls: ['./createedit-stockTracking.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    {
      provide: MAT_DATE_FORMATS, useValue: MY_FORMATS
    },
  ],

})
export class CreateeditStockTrackingComponent implements OnInit {

  selectedStockTracking: any;
  stocktracking: FormGroup;
  mapprocesstypes: { name: string; id: number }[] = [];
  isInvalidPrice: boolean;
  supplierscards: suppliersListDto[] = [];
  buttonDisabled = false;
  productid: string;
  entryexittype : StockTrackingType;
  isExit: boolean = false;
  supplierId : string;
  now: Date = new Date();

  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    private _translocoService: TranslocoService,
    private _suppliersService: SuppliersService,
    private _stocktracking: StockTrackingService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectedStockTracking = data.data;
    this.productid = data.productid;
    this.entryexittype = data.entryexittype;
    this.supplierId = data.supplierId;
    if(this.entryexittype === StockTrackingType.Exit){
      this.isExit = true;
    }
  }

  ngOnInit() {

    for (var n in ProcessTypes) {
      if (typeof ProcessTypes[n] === 'number') {
        this.mapprocesstypes.push({ id: <any>ProcessTypes[n], name: n });
      }
    }

    if(this.entryexittype === StockTrackingType.Exit){
      this.mapprocesstypes = [];
      for (var n in ProcessTypesExit) {
        if (typeof ProcessTypesExit[n] === 'number') {
          this.mapprocesstypes.push({ id: <any>ProcessTypesExit[n], name: n });
        }
      }
    }
      
    this.stocktracking = this._formBuilder.group({
      piece: [0, [Validators.required]],
      processtypes: [1],
      purchaseprice: [0],
      supplierId: [this.supplierId == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000'  : this.supplierId ],
      expirationdate: [this.now]
    })

    this.getSuppliers();
    this.fillFormData(this.selectedStockTracking);
  }

  fillFormData(selectedStockTracking: any) {
    if (this.selectedStockTracking !== null) {
        this.stocktracking.setValue({
            piece: selectedStockTracking.piece,
            processtypes: selectedStockTracking.processType,
            purchaseprice : selectedStockTracking.purchasePrice,
            supplierId : selectedStockTracking.supplierId,
            expirationdate : selectedStockTracking.expirationDate
        });
    }
}

  closeDialog(): void {
    this._dialogRef.close({ status: null });
  }

  getSuppliers() {
    this._suppliersService.getSuppliersList().subscribe((response) => {
      this.supplierscards = response.data;
      console.log(this.supplierscards);
    });
  }

  formatPrice(event: any) {
    const value = event.target.value;
    const parsedValue = parseFloat(value.replace(',', '.'));
    if (isNaN(parsedValue)) {
      this.isInvalidPrice = true;
    } else {
      this.isInvalidPrice = false;
      const formattedValue = parsedValue.toFixed(2);
      console.log(formattedValue); // Formatlanmış değeri kullanabilirsiniz
    }
  }

  addOrUpdateStockTracking(): void {
    this.buttonDisabled = true;

    if (!this.checkFormValidity()) {
      this.showSweetAlert('error', "İlgili Alanları Kontrol Ediniz.");
      this.buttonDisabled = false;
      return;
    }

    this.selectedStockTracking
      ? this.updateStockTracking()
      : this.addStockTracking();
  }

  addStockTracking(): void {
    let item = new CreateStockTrackingCommand(
      this.productid,
      this.entryexittype,
      this.getFormValueByName('piece'),
      this.getFormValueByName('purchaseprice'),
      this.getFormValueByName('supplierId'),
      this.getFormValueByName('expirationdate'),
    );
 
    this._stocktracking.createStockTracking(item).subscribe(
      (response) => {
        if (response.isSuccessful) {
          this.showSweetAlert(
            'success',
            'sweetalert.transactionSuccessful'
          );
          this._dialogRef.close({
            status: true,
          });
        } else {
          this.showSweetAlert(
            'error',
            'sweetalert.transactionFailed'
          );
        }
      },
      (err) => {
        console.log(err);
      }
    );

  }

  updateStockTracking(): void {
    let item = new UpdateStockTrackingCommand(
      this.selectedStockTracking.id,
      this.productid,
      this.entryexittype,
      this.getFormValueByName('piece'),
      this.getFormValueByName('purchaseprice'),
      this.getFormValueByName('supplierId'),
      this.getFormValueByName('expirationdate'),
    );
 
    this._stocktracking.updateStockTracking(item).subscribe(
      (response) => {
        if (response.isSuccessful) {
          this.showSweetAlert(
            'success',
            'sweetalert.transactionSuccessful'
          );
          this._dialogRef.close({
            status: true,
          });
        } else {
          this.showSweetAlert(
            'error',
            'sweetalert.transactionFailed'
          );
        }
      },
      (err) => {
        console.log(err);
      }
    );

  }

  getFormValueByName(formName: string): any {
    return this.stocktracking.get(formName).value;
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

  checkFormValidity() {
    if (this.stocktracking.invalid) {
      return false;
    }
    const formValues = this.stocktracking.value;
    if (formValues.piece <= 0) {
      return false;
    }
    return true;
  }


}
