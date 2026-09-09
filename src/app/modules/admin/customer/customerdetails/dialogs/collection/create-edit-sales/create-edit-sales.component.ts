import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { PaymentMethodservice } from 'app/core/services/definition/paymentmethods/paymentmethods.service';
import { TaxisService } from 'app/core/services/definition/taxis/taxis.service';
import { GeneralService } from 'app/core/services/general/general.service';
import { PaymentMethodsDto } from 'app/modules/admin/definition/paymentmethods/models/PaymentMethodsDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { EventService } from '../../../services/event.service';
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
    selector: 'app-create-edit-sales',
    templateUrl: './create-edit-sales.component.html',
    styleUrls: ['./create-edit-sales.component.css'],
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
export class CreateEditSalesComponent implements OnInit {


    @Output() salesAdded = new EventEmitter<any>();

    sales: FormGroup;
    selectedgetsales: any;
    buttonDisabled = false;
    payments: PaymentMethodsDto[] = [];
    selectedItemSellingPrice: any;
    selectedCustomerId: any;
    selectedSaleOwnerId: any;
    selectedCollectionId: any;

    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _translocoService: TranslocoService,
        private _paymentmethodsService: PaymentMethodservice,
        private _customerService: CustomerService,
        private _taxisService: TaxisService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private eventService: EventService,
    ) {
        this.selectedgetsales = data.data;
        this.selectedCustomerId = data.customerId;
        this.selectedItemSellingPrice = data.amount;
        this.selectedSaleOwnerId = data.saleOwnerId;
        this.selectedCollectionId = data.collectionId;
    }

    ngOnInit() {
        this.paymentsList();
        this.sales = this._formBuilder.group({
            date: new FormControl(new Date()),
            paymenttype: [1, Validators.required],
            amount: [this.selectedItemSellingPrice],
            remark: ['']
        });
        this.fillFormData(this.selectedgetsales);
    }

    fillFormData(selectedgetsales: any) {
        if (this.selectedgetsales !== null) {
            this.sales.setValue({
                date: selectedgetsales.date,
                paymenttype: selectedgetsales.paymetntId,
                amount: selectedgetsales.credit,
                remark: selectedgetsales.remark
            });
        }
    }

    addOrUpdateSales(): void {
        this.buttonDisabled = true;
        this.selectedgetsales ? this.updateSaleCollection() : this.addSaleCollection();
    }

    addSaleCollection(): void {


        const model = {
            saleOwnerId: this.selectedSaleOwnerId,
            customerId: this.selectedCustomerId,
            paymentId: this.getFormValueByName('paymenttype'),
            date: this.getFormValueByName('date'),
            amount: this.getFormValueByName('amount'),
            remark: this.getFormValueByName('remark'),
            collectionId: this.selectedCollectionId
        };


        if (parseFloat(model.amount) <= 0) {
            this.showSweetAlert(
                'error',
                "Sıfır veya Sıfırın altında tutar girilemez."
            );
            this.buttonDisabled = false;
            return;
        }

        if (parseFloat(model.amount) > this.selectedItemSellingPrice) {
            this.showSweetAlert(
                'error',
                this.selectedItemSellingPrice + " Belirtilen tutar üzerine giriş yapamazsınız."
            );
            this.buttonDisabled = false;
            return;
        }

        this._customerService
            .CreateSaleCollection(model)
            .subscribe(
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
                        this.buttonDisabled = false;
                    }
                },
                (err) => {
                    console.log(err);
                }
            );
        this.eventService.dialogClosed.emit(true);
        this.salesAdded.emit();
    }

    updateSaleCollection(): void {

        const model = {
            saleOwnerId: this.selectedSaleOwnerId,
            customerId: this.selectedCustomerId,
            paymentId: this.getFormValueByName('paymenttype'),
            date: this.getFormValueByName('date'),
            amount: this.getFormValueByName('amount'),
            remark: this.getFormValueByName('remark'),
            collectionId: this.selectedCollectionId
        };

        if (parseFloat(model.amount) <= 0) {
            this.showSweetAlert(
                'error',
                "Sıfır veya Sıfırın altında tutar girilemez."
            );
            this.buttonDisabled = false;
            return;
        }

        if (parseFloat(model.amount) > this.selectedItemSellingPrice) {
            this.showSweetAlert(
                'error',
                this.selectedItemSellingPrice + " Belirtilen tutar üzerine giriş yapamazsınız."
            );
            this.buttonDisabled = false;
            return;
        }

        this._customerService
            .updateSaleCollection(model)
            .subscribe(
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
                        this.buttonDisabled = false;
                    }
                },
                (err) => {
                    console.log(err);
                }
            );
        this.eventService.dialogClosed.emit(true);
        this.salesAdded.emit();

    }

    paymentsList() {
        this._paymentmethodsService
            .getPaymentMethodsList()
            .subscribe((response) => {
                this.payments = response.data;
                console.log(this.payments);

            });
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

    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }

    getFormValueByName(formName: string): any {
        return this.sales.get(formName).value;
    }

}
