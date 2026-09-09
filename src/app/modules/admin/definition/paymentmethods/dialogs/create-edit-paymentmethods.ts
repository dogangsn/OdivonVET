import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { TranslocoService } from '@ngneat/transloco';
import { PaymentMethodsDto } from '../models/PaymentMethodsDto';
import { PaymentMethodservice } from 'app/core/services/definition/paymentmethods/paymentmethods.service';
import { CreatePaymentMethodsCommand } from '../models/CreatePaymentMethodsCommand';
import { UpdatePaymentMethodsCommand } from '../models/UpdatePaymentMethodsCommand';

@Component({
    selector: 'app-create-edit-paymentmethods-dialog',
    styleUrls: ['./create-edit-paymentmethods.scss'],
    templateUrl: './create-edit-paymentmethods.html',
})
export class CreateEditPaymentMethodsDialogComponent implements OnInit {
    selectedPaymentMethods: PaymentMethodsDto;
    paymentmethods: FormGroup;
    buttonDisabled = false;
    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _paymentmethodsService : PaymentMethodservice,
        private _translocoService: TranslocoService,
        @Inject(MAT_DIALOG_DATA) public data: PaymentMethodsDto
    ) {
        this.selectedPaymentMethods = data;
    }

    ngOnInit(): void {
        this.paymentmethods = this._formBuilder.group({
            name: [''],
            remark: ['']
        });

        this.fillFormData(this.selectedPaymentMethods);
    }

    fillFormData(selectedPaymentMethod: PaymentMethodsDto) {
        debugger;
        if (this.selectedPaymentMethods !== null) {
            this.paymentmethods.setValue({
                name: selectedPaymentMethod.name,
                remark: selectedPaymentMethod.remark,
            });
        }
    }

    addOrUpdatepaymentmethods(): void {
        this.buttonDisabled = true;
        this.selectedPaymentMethods
            ? this.updatepaymentmethods()
            : this.addpaymentmethods();
    }

    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }

    addpaymentmethods(): void {
        const paymentmethodsItem = new CreatePaymentMethodsCommand( 
            this.getFormValueByName('name'),
            this.getFormValueByName('remark')
        );

        this._paymentmethodsService.creatPaymentMethods(paymentmethodsItem).subscribe(
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

    updatepaymentmethods(): void{
        const paymentMethodsItem = new UpdatePaymentMethodsCommand(
            this.selectedPaymentMethods.recId,
            this.getFormValueByName('name'),
            this.getFormValueByName('remark'),
        );

        this._paymentmethodsService.updatePaymentMethods(paymentMethodsItem).subscribe(
            (response) => {
                debugger;

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
        return this.paymentmethods.get(formName).value;
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
