import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { SaleBuyListDto } from '../model/SaleBuyListDto';
import { SaleBuyService } from 'app/core/services/ratail/salebuy.service';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { customersListDto } from '../../customer/models/customersListDto';
import { ProductDescriptionService } from 'app/core/services/definition/productdescription/productdescription.service';
import { ProductDescriptionsDto } from '../../definition/productdescription/models/ProductDescriptionsDto';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { CreateSaleBuyCommand } from '../model/CreateSaleBuyCommand';
import { suppliersListDto } from '../../suppliers/models/suppliersListDto';
import { SuppliersService } from 'app/core/services/suppliers/suppliers.service';
import { PaymentMethodsDto } from '../../definition/paymentmethods/models/PaymentMethodsDto';
import { PaymentMethodservice } from 'app/core/services/definition/paymentmethods/paymentmethods.service';
import { UpdateSaleBuyCommand } from '../model/UpdateSaleBuyCommand';

import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { TaxisService } from 'app/core/services/definition/taxis/taxis.service';
import { Observable, Subject, takeUntil, zip } from 'rxjs';
import { TaxesDto } from '../../definition/taxes/models/taxesDto';
const moment = _rollupMoment || _moment;
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
    selector: 'app-create-edit-salesbuy',
    templateUrl: './create-edit-salesbuy.component.html',
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
export class CreateEditSalesBuyComponent implements OnInit {
    selectedsalebuy: SaleBuyListDto;
    salebuy: FormGroup;
    customerlist: customersListDto[] = [];
    selectedCustomerId: any = '';
    selectedProductId: any = '';
    productdescription: ProductDescriptionsDto[] = [];
    supplierscards: suppliersListDto[] = [];
    payments: PaymentMethodsDto[] = [];
    taxisList: TaxesDto[] = [];

    visibleCustomer: boolean;
    salebuyType: number;
    isSupplier: boolean;
    buttonDisabled = false;
    destroy$: Subject<boolean> = new Subject<boolean>();

    unitPrice: number;
    vatId: string;
    productId: string;
    netPrice: number;

    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _translocoService: TranslocoService,
        private _salebuyservice: SaleBuyService,
        private _customerListService: CustomerService,
        private _productdescriptionService: ProductDescriptionService,
        private _suppliersService: SuppliersService,
        private _paymentmethodsService: PaymentMethodservice,
        private _taxisService: TaxisService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.visibleCustomer = data.visibleCustomer;
        this.salebuyType = data.salebuyType;
        this.selectedsalebuy = data.selectedsalebuy;
        this.isSupplier = data.isSupplier;
    }

    ngOnInit() {

        zip(
            this.getTaxisList(),
            this.getProductList(),
            this.paymentsList(),
            this.getCustomerList()
        ).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (value) => {
                this.setTaxis(value[0]),
                    this.setProductList(value[1]),
                    this.setPaymentList(value[2]),
                    this.setCustomerList(value[3])
            },
            error: (e) => {
                console.log(e);
            },
            complete: () => {
                this.fillFormData(this.selectedsalebuy);
            }
        });

        if (this.isSupplier) {
            this.getSuppliers();
        }

        this.salebuy = this._formBuilder.group({
            customerId: ['00000000-0000-0000-0000-000000000000'],
            date: [new Date()],
            productId: [
                '00000000-0000-0000-0000-000000000000',
                Validators.required,
            ],
            remark: [''],
            supplierId: ['00000000-0000-0000-0000-000000000000'],
            invoiceNo: [''],
            paymentType: [1],
            amount: [1],
        });


    }

    fillFormData(selectedSale: SaleBuyListDto) {
        if (this.selectedsalebuy !== null) {
            this.salebuy.setValue({
                date: selectedSale.date,
                invoiceNo: selectedSale.invoiceNo,
                supplierId: selectedSale.supplierId,
                productId: selectedSale.productId,
                paymentType: selectedSale.paymentType,
                customerId: selectedSale.customerId,
                remark: selectedSale.remark,
                amount: selectedSale.amount
            });


            const selectedProduct = this.productdescription.find(product => product.id === selectedSale.productId);
            if (selectedProduct) {
                this.productId = selectedProduct ? selectedProduct.id : null;
                this.unitPrice = selectedProduct ? selectedProduct.sellingPrice : null;
                this.vatId = selectedProduct ? selectedProduct.taxisId : null;
            }

        }
    }

    getCustomerList(): Observable<any> {
        let model = {
            IsArchive: false
        }
        return this._customerListService.getcustomerlist(model);
    }

    setCustomerList(response: any): void {
        if (response.data) {
            this.customerlist = response.data;
        }
    }

    getProductList(): Observable<any> {
        const model = {
            ProductType: 1,
        };
        return this._productdescriptionService.getProductDescriptionFilters(model);
    }

    setProductList(response: any): void {
        if (response.data) {
            this.productdescription = response.data;
            this.productdescription = this.productdescription.filter(x=>x.active === true);
        }
    }

    getTaxisList(): Observable<any> {
        return this._taxisService.getTaxisList();
    }

    setTaxis(response: any): void {
        if (response.data) {
            this.taxisList = response.data;
        }
    }

    getSuppliers() {
        this._suppliersService.getSuppliersList().subscribe((response) => {
            this.supplierscards = response.data;
            console.log(this.supplierscards);
        });
    }

    paymentsList(): Observable<any> {
        return this._paymentmethodsService
            .getPaymentMethodsList();
    }

    setPaymentList(response: any) {
        if (response.data) {
            this.payments = response.data;
        }
    }

    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }

    filterCustomerId(value: any): void {
        this.selectedCustomerId = value;
    }

    filterProductId(value: any): void {
        this.selectedProductId = value;
    }

    getFormValueByName(formName: string): any {
        return this.salebuy.get(formName).value;
    }

    addOrUpdateSaleBuy(): void {
        this.buttonDisabled = true;
        this.selectedsalebuy ? this.updateBuySale() : this.addBuySale();
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
                this.getFormValueByName('customerId'),
                this.getFormValueByName('date'),
                this.getFormValueByName('productId'),
                this.getFormValueByName('remark'),
                this.salebuyType,
                this.getFormValueByName('supplierId'),
                this.getFormValueByName('invoiceNo'),
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

    updateBuySale(): void {
        if (this.salebuy.valid) {
            const _amount = this.getFormValueByName('amount');
            if (_amount == 0) {
                this.showSweetAlert(
                    'error',
                    'Miktar Bilgisi 0(sıfır) büyük olmalıdır.'
                );
            }

            const saleBuyItem = new UpdateSaleBuyCommand(
                this.selectedsalebuy.id,
                this.selectedsalebuy.ownerId,
                this.getFormValueByName('customerId'),
                this.getFormValueByName('date'),
                this.getFormValueByName('productId'),
                this.getFormValueByName('remark'),
                this.salebuyType,
                this.getFormValueByName('supplierId'),
                this.getFormValueByName('invoiceNo'),
                this.getFormValueByName('paymentType'),
                this.getFormValueByName('amount'),
                '00000000-0000-0000-0000-000000000000'
            );

            this._salebuyservice.updateSaleBuy(saleBuyItem).subscribe(
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

    onProductSelectionChange(element: any): void {
        const selectedProduct = this.productdescription.find(product => product.id === element.value);
        if (selectedProduct) {
            this.productId = selectedProduct ? selectedProduct.id : null;
            this.unitPrice = selectedProduct ? selectedProduct.sellingPrice : null;
            this.vatId = selectedProduct ? selectedProduct.taxisId : null;

        }
    }

    calculateTotal(): number {
        const quantity = parseFloat(this.getFormValueByName('amount'));
        let totalPrice = quantity * this.unitPrice;
        let calcvat = 0;
        if (this.productId !== undefined && this.productId.length > 0) {
            const price = quantity * this.unitPrice;
            const vatRate = this.taxisList.find(x => x.id === this.vatId).taxRatio;
            const inculeKDV = this.productdescription.find(x => x.id === this.productId).sellingIncludeKDV;
            if (price > 0 && vatRate > 0) {
                if (inculeKDV) {
                    let basePrice = price / (1 + (vatRate / 100))
                    calcvat = price - basePrice;
                    totalPrice = totalPrice - calcvat;
                } else {
                    calcvat = (price * vatRate) / 100
                    totalPrice = totalPrice;
                }
            }
        }
        return totalPrice;
    }

    calculateSubtotal(): number {
        let acc = 0;
        if (this.productId !== undefined && this.productId.length > 0) {
            if (this.unitPrice > 0) {
                acc = this.calculateTotal();
            }
        }
        return acc;
    }

    calculateVat(): number {
        let calcvat = 0;
        if (this.productId !== undefined && this.productId.length > 0) {
            const quantity = parseFloat(this.getFormValueByName('amount'));
            const price = quantity * this.unitPrice;
            const vatRate = this.taxisList.find(x => x.id === this.vatId).taxRatio;
            const includeKDV = this.productdescription.find(x => x.id === this.productId).sellingIncludeKDV;

            if (price > 0 && vatRate > 0) {
                if (includeKDV) {
                    const basePrice = price / (1 + (vatRate / 100));
                    calcvat = price - basePrice;
                } else {
                    calcvat = (price * vatRate) / 100;
                }
            }
        }
        return calcvat;
    }

    calculateTotalAmount(): number {
        return this.calculateSubtotal() + this.calculateVat();
    }

}
