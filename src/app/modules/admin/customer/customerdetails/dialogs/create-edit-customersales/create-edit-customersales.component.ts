import { Component, Inject, OnInit } from '@angular/core'; 
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { SaleBuyService } from 'app/core/services/ratail/salebuy.service';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { ProductDescriptionService } from 'app/core/services/definition/productdescription/productdescription.service';
import { SuppliersService } from 'app/core/services/suppliers/suppliers.service';
import { PaymentMethodservice } from 'app/core/services/definition/paymentmethods/paymentmethods.service';
import { ProductDescriptionsDto } from 'app/modules/admin/definition/productdescription/models/ProductDescriptionsDto';
import { PaymentMethodsDto } from 'app/modules/admin/definition/paymentmethods/models/PaymentMethodsDto';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { CreateSaleBuyCommand } from 'app/modules/admin/retail/model/CreateSaleBuyCommand';
import { CustomerSalesDto } from '../../../models/customersalesDto';

@Component({
    selector: 'app-create-edit-customersales',
    templateUrl: './create-edit-customersales.component.html',
    styleUrls: ['./create-edit-customersales.component.css'],
})
export class CreateEditCustomersalesComponent implements OnInit {
    selectedcustomersale: CustomerSalesDto;
    buttonDisabled = false;

    productdescription: ProductDescriptionsDto[] = [];
    payments: PaymentMethodsDto[] = [];
    selectedProductId: any = '';
    salebuy: FormGroup;

    selectedCustomerId: any;

    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _translocoService: TranslocoService,
        private _salebuyservice: SaleBuyService,
        private _customerListService: CustomerService,
        private _productdescriptionService: ProductDescriptionService,
        private _suppliersService: SuppliersService,
        private _paymentmethodsService: PaymentMethodservice,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.selectedCustomerId = data;
    }

    ngOnInit() {
        this.getProductList();
        this.paymentsList();

        this.salebuy = this._formBuilder.group({
            date: [new Date()],
            productId: [
                '00000000-0000-0000-0000-000000000000',
                Validators.required,
            ],
            remark: [''],
            paymentType: [1],
            amount: [1],
        });
    }

    addOrUpdateCustomerSale(): void {
        this.buttonDisabled = true;
        this.selectedcustomersale ? this.updateBuySale() : this.addBuySale();
    }

    getProductList() {
        const model = {
            ProductType : 1
        }
        this._productdescriptionService
            .getProductDescriptionFilters(model)
            .subscribe((response) => {
                this.productdescription = response.data;
                console.log(this.productdescription);
            });
    }

    paymentsList() {
        this._paymentmethodsService
            .getPaymentMethodsList()
            .subscribe((response) => {
                this.payments = response.data;
                console.log(this.payments);
            });
    }

    addBuySale(): void {
        if (this.salebuy.valid) {
            const _amount = this.getFormValueByName('amount');
            if (_amount == 0) {
                this.showSweetAlert(
                    'error',
                    'Miktar Bilgisi 0(sıfır) büyük olmalıdır.'
                );
            }

            const saleBuyItem = new CreateSaleBuyCommand(
                this.selectedCustomerId.customerId,
                this.getFormValueByName('date'),
                this.getFormValueByName('productId'),
                this.getFormValueByName('remark'),
                1,
                '00000000-0000-0000-0000-000000000000',
                '',
                this.getFormValueByName('paymentType'),
                this.getFormValueByName('amount'),
                '00000000-0000-0000-0000-000000000000'
            );
            this._salebuyservice.createSaleBuy(saleBuyItem).subscribe(
                (response) => {
                    debugger;

                    if (response.isSuccessful) {
                        this.showSweetAlert('success', 'sweetalert.success');
                        this._dialogRef.close({
                            status: true,
                        });
                    } else {
                        this.showSweetAlert('error', 'sweetalert.error');
                    }
                },
                (err) => {
                    console.log(err);
                }
            );
        } else {
            if (!this.salebuy.get('productId').value) {
                this.showSweetAlert('error', 'Ürün Seçimi Yapınız.');
            }
        }
    }

    updateBuySale(): void {}

    getFormValueByName(formName: string): any {
        return this.salebuy.get(formName).value;
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

    filterProductId(value: any): void {
        this.selectedProductId = value;
    }
}
