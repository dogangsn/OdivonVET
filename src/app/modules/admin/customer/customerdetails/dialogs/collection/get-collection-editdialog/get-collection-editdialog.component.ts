import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { PaymentMethodservice } from 'app/core/services/definition/paymentmethods/paymentmethods.service';
import { GeneralService } from 'app/core/services/general/general.service';
import { PaymentMethodsDto } from 'app/modules/admin/definition/paymentmethods/models/PaymentMethodsDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { PaymentTransactionListDto } from './model/PaymentTransactionListDto';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { TaxesDto } from 'app/modules/admin/definition/taxes/models/taxesDto';
import { TaxisService } from 'app/core/services/definition/taxis/taxis.service';

@Component({
    selector: 'app-get-collection-editdialog',
    templateUrl: './get-collection-editdialog.component.html',
    styleUrls: ['./get-collection-editdialog.component.css'],
})
export class GetColectionEditDialogComponent implements OnInit {

    selectedgetcollection: any;
    getcollection: FormGroup;
    buttonDisabled = false;

    ratioVisible = false;

    payments: PaymentMethodsDto[] = [];
    selectedCustomerId: any;
    paymentTransaction: PaymentTransactionListDto[] = [];
    selectedValue: string;
    selectedItemSellingPrice: any;
    selectedVaccineid: any;
    selectedtaxisid:any;
    taxisList: TaxesDto[] = [];

    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _translocoService: TranslocoService,
        private _paymentmethodsService: PaymentMethodservice,
        private _customerService: CustomerService,
        private _taxisService: TaxisService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.selectedCustomerId = data;
    }

    ngOnInit(): void {
        this.paymentsList();
        this.getTaxisList();
        this.getPaymentTransactiopnList();
        this.getcollection = this._formBuilder.group({
            collectionId: ['', Validators.required],
            paymenttype: [1, Validators.required],
            amount: [0],
            ratio: [0],
            enterAmount: [false],
            taxisId: ['']
        });
        this.selectedItemSellingPrice = 0;
        this.getcollection.get('amount').disable();
    }

    getFormValueByName(formName: string): any {
        return this.getcollection.get(formName).value;
    }

    paymentsList() {
        this._paymentmethodsService
            .getPaymentMethodsList()
            .subscribe((response) => {
                this.payments = response.data;
                console.log(this.payments);

            });
    }

    getPaymentTransactiopnList() {

        const model = {
            CustomerId: this.selectedCustomerId.customerId
        }

        this._customerService
            .getPaymentTransactionList(model)
            .subscribe((response) => {
                this.paymentTransaction = response.data;
                console.log(this.paymentTransaction);

            });
    }

    showSweetAlert(type: string, message: string, alertTYpe: SweetalertType): void {
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
                alertTYpe
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

    onSelectionChange(event: any) {

        debugger;
        this.selectedValue = event.value;

        const selectedItem = this.paymentTransaction.find(item => item.id === this.selectedValue);
        if (selectedItem) {
            this.selectedItemSellingPrice = selectedItem.sellingPrice;
            this.selectedVaccineid = selectedItem.vaccineid;
            this.selectedtaxisid = selectedItem.taxisId
            if(selectedItem.isDefaultPrice){
                this.selectedItemSellingPrice = selectedItem.price;
            }
        }

        this.getcollection.patchValue({taxisId:this.selectedtaxisid,amount:this.selectedItemSellingPrice})

    }

    addOrUpdateCollection(): void {
        this.buttonDisabled = true;
        this.selectedgetcollection ? this.updateCollection() : this.addCollection();
    }

    addCollection(): void {
        debugger;
        if (this.fillSelectedInvoice()) {

            const model = {
                CustomerId: this.selectedCustomerId.customerId,
                CollectionId: this.getFormValueByName('collectionId'),
                PaymentType: this.getFormValueByName('paymenttype'),
                Amount: this.getFormValueByName('amount'),
                TaxisId: this.getFormValueByName('taxisId'),
                Ratio: this.getFormValueByName('ratio'),
                EnterAmount: this.getFormValueByName('enterAmount'),
                Vaccineid: this.selectedVaccineid
            }
            this._customerService.createCollection(model).subscribe(
                (response) => {
                    if (response.isSuccessful) {
                        this.showSweetAlert('success', 'sweetalert.success', SweetalertType.success);
                        this._dialogRef.close({
                            status: true,
                        });
                    } else {
                        debugger;
                        this.showSweetAlert('error', response.errors[0], SweetalertType.error);
                    }
                },
                (err) => {
                    this.buttonDisabled = false;
                    this.showSweetAlert('error', err.message, SweetalertType.error);
                }
            );

        }
    }

    updateCollection(): void {
    }

    fillSelectedInvoice(): boolean {
        if(this.getcollection.invalid){this.getcollection.markAllAsTouched();this.buttonDisabled=false;return false;}
        return true;
    }

    toggleAmountInput(checked: boolean) {
        if (checked) {
            this.getcollection.get('amount').enable();
            this.ratioVisible = true;
        } else {
            this.getcollection.get('amount').disable();
            this.ratioVisible = false;
        }
    }

    getTaxisList(): void {
        this._taxisService.getTaxisList().subscribe((response) => {
          this.taxisList = response.data;
        });
      }
    

}