import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { TaxesDto } from '../models/taxesDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { TaxisService } from 'app/core/services/definition/taxis/taxis.service';
import { CreateTaxisCommand } from '../models/CreateTaxisCommand';
import { UpdateTaxisCommand } from '../models/UpdateTaxisCommand';

@Component({
  selector: 'app-create-edit-taxes',
  templateUrl: './create-edit-taxes.component.html',
  styleUrls: ['./create-edit-taxes.component.css']
})
export class CreateEditTaxesComponent implements OnInit {

  selectedtaxes: TaxesDto;
  buttonDisabled = false;
  taxes: FormGroup;

  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    private _translocoService: TranslocoService,
    private _taxisService: TaxisService,
    @Inject(MAT_DIALOG_DATA) public data: TaxesDto
  ) {
    this.selectedtaxes = data;
  }

  ngOnInit() {
    this.taxes = this._formBuilder.group({
      taxName: ['', Validators.required],
      taxRatio: ['', Validators.required]
    });
    this.fillFormData(this.selectedtaxes);
  }

  fillFormData(selectedtaxis: TaxesDto) {

    if (this.selectedtaxes !== null) {
      this.taxes.setValue({
        taxName: selectedtaxis.taxName,
        taxRatio: selectedtaxis.taxRatio,
      });
    }
  }

  closeDialog(): void {
    this._dialogRef.close({ status: null });
  }

  addUpdateTaxes(): void {
    this.buttonDisabled = true;
    this.selectedtaxes
      ? this.updateTaxes()
      : this.addcTaxes();
  }

  addcTaxes(): void {

    const item = new CreateTaxisCommand(
      this.getFormValueByName('taxName'),
      this.getFormValueByName('taxRatio')
    );

    this._taxisService.createTaxis(item).subscribe(
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

  updateTaxes() {
    const storeItem = new UpdateTaxisCommand(
        this.selectedtaxes.id,
        this.getFormValueByName('taxName'),
        this.getFormValueByName('taxRatio'),
    );

    this._taxisService.updateTaxis(storeItem).subscribe(
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

  getFormValueByName(formName: string): any {
    return this.taxes.get(formName).value;
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
