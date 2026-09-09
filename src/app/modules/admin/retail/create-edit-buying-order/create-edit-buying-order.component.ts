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
import { PaymentMethodsDto } from '../../definition/paymentmethods/models/PaymentMethodsDto';
import { PaymentMethodservice } from 'app/core/services/definition/paymentmethods/paymentmethods.service';
import { demandTransList, demandsListDto } from '../../demands/models/demandListDto';
import { DemandProductsService } from 'app/core/services/Demands/DemandProducts/demandproducts.service';
import { Subject, takeUntil } from 'rxjs';

import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

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
    selector: 'app-create-edit-buying-order',
    templateUrl: './create-edit-buying-order.component.html',
    styles: [
        /* language=SCSS */
        `
        .inventory-grid {
            grid-template-columns: 40px auto 40px;

            @screen sm {
                grid-template-columns: 48px auto 112px 72px 96px 72px;
            }

            @screen md {
                grid-template-columns: 48px 112px auto 112px 72px;
            }

            @screen lg {
                grid-template-columns: 96px auto 112px 112px 96px 48px 96px 72px 72px;
            }
        }
        `],
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
export class CreateEditBuyOrderComponent implements OnInit {
    selectedsalebuy: SaleBuyListDto;
    salebuy: FormGroup;
    customerlist: customersListDto[] = [];
    selectedDocumentNo: any = '';
    selectedProductId: any = '';
    productdescription: ProductDescriptionsDto[] = [];
    payments: PaymentMethodsDto[] = [];
    demandcards : demandsListDto[] 
    visibleCustomer: boolean;
    salebuyType: number;
    isSupplier: boolean;
    demandTransList: demandTransList[] = [];
    demandTransListlast: demandTransList[] = [];
    isVisible:boolean = false;
    selectedDemand: demandsListDto | null = null;
    demandList : demandsListDto;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _translocoService: TranslocoService,
        private _salebuyservice: SaleBuyService,
        private _customerListService: CustomerService,
        private _productdescriptionService: ProductDescriptionService,
        private _paymentmethodsService : PaymentMethodservice,
        private demandProductsService: DemandProductsService,
        

        private cdr: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.visibleCustomer = data.visibleCustomer;
        this.salebuyType = data.salebuyType;
        this.selectedsalebuy = data.selectedsalebuy;
        debugger;
        this.isSupplier = data.isSupplier;
        if(this.isSupplier === false)
        {
            debugger;
            this.selectedDocumentNo = data.demandList;
            this.selectedDemand  = data.demandList;

        }
    }
    
    ngOnInit() {
        this.salebuy = this._formBuilder.group({
            date: [new Date()],
            productId: [
                '00000000-0000-0000-0000-000000000000',
                Validators.required,
            ],
            remark: [''],
            supplierId: ['00000000-0000-0000-0000-000000000000'],
            invoiceNo: [''],
            paymentType: [1],
            amount:[1]
        });
        debugger;
        this.getCustomerList();
        this.getProductList();
        this.paymentsList();
        if(this.isSupplier)
        {
            this.getDemands();
        }
        else{
            this.getDemandProducts();
            // this.selectedDemand.id = value;
            this.toggleDetails(this.selectedDemand.id);
            this.isVisible = true;
        }
      

        // if(this.isSupplier){
        //     this.getSuppliers();
        // }




    }

    toggleDetails(demandId: string): void {
        debugger;
        var demand = this.demandcards.find(x => x.id === demandId);
        this.selectedDemand = demand;
        this.cdr.markForCheck();
    }

    getDemandProducts() {

        const demandProductItem = new demandTransList(
            this.selectedDemand.id,
            '00000000-0000-0000-0000-000000000000',
            0,
            0,
            0,
            0,
            0,
            0,
            '0',
            '00000000-0000-0000-0000-000000000000',
            'TaxisId'
        );
        //this.getTransforid.id = ;


        this.demandProductsService.getDemandTransList(demandProductItem)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                if (response && response.data) {
                    debugger;
                    this.demandTransListlast = response.data
                    this.demandTransList = this.demandTransListlast.filter(x => x.ownerId === this.selectedDemand.id);
                    this.cdr.markForCheck();
                    console.log(this.demandTransList);
                    // Diğer işlemleri burada gerçekleştirin.
                }
            });

    }

    getDemands() {

        this.demandProductsService.getDemandComplateList()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response) => {
            if (response && response.data) {
                debugger;
                this.demandcards = response.data.filter(x=>x.isBuying === false);
                this.cdr.markForCheck();     
                console.log(this.demandcards);
                // Diğer işlemleri burada gerçekleştirin.
            }
        });

    }

    getCustomerList() {
        let model = {
            IsArchive : false
        }
        this._customerListService.getcustomerlist(model).subscribe((response) => {
            this.customerlist = response.data;
            console.log(this.customerlist);
        });
    }

    getProductList() {
        this._productdescriptionService
            .GetProductDescriptionList()
            .subscribe((response) => {
                this.productdescription = response.data;
            });
    }

    // getSuppliers() {
    //     this._suppliersService.getSuppliersList().subscribe((response) => {
    //         this.supplierscards = response.data;
    //         console.log(this.supplierscards);
    //     });
    // }

    paymentsList() {
        this._paymentmethodsService.getPaymentMethodsList().subscribe((response) => {
            this.payments = response.data;
            console.log(this.payments);
        });
    }

    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }

    filterDocumentNo(value: any): void {
        debugger;
        this.selectedDocumentNo = value;
        // this.selectedDemand.id = value;
        this.toggleDetails(value);
        this.getDemandProducts();
        this.isVisible = true;
    }

    filterProductId(value: any): void {
        this.selectedDocumentNo = value;
    }

    getFormValueByName(formName: string): any {
        return this.salebuy.get(formName).value;
    }

    addOrUpdateSaleBuy(): void {
         this.addBuyOrder();
    }

    addBuyOrder(): void {
        if (this.salebuy.valid) {

            // const _amount = this.getFormValueByName('amount');
            // if(_amount == 0){
            //     this.showSweetAlert('error', 'Miktar Bilgisi 0(sıfır) büyük olmalıdır.');
            // }
            const datte = this.getFormValueByName('date').toISOString();
            const documNo = this.selectedDemand.documentno;
            this.demandTransList.forEach(item=>
                {
                    const saleBuyItem = new CreateSaleBuyCommand(
                        '00000000-0000-0000-0000-000000000000',
                        datte,
                        item.productId,
                        'test',
                        this.salebuyType,
                        this.selectedDemand.suppliers,
                        documNo,
                        this.getFormValueByName('paymentType'),
                        // this.getFormValueByName('amount')
                        item.stockState,
                        this.selectedDemand.id
                    );
                        debugger;
                    this._salebuyservice.createSaleBuy(saleBuyItem).subscribe(
                        (response) => {
                            debugger;
                            
                            if (response.isSuccessful) {
                                this.demandProductsService.updateBuyDemands(this.selectedDemand).subscribe(
                                    (response) => {
                                        if (response.isSuccessful) {
                                            this.showSweetAlert('success', 'sweetalert.success');
                                            this._dialogRef.close({
                                                status: true,
                                            });
                                        } else {
                                            this.showSweetAlert('error','sweetalert.error');
                                        }
                                    },
                                    (err) => {
                                        console.log(err);
                                    }
                                );
                                
                            } else {
                                this.showSweetAlert('error','sweetalert.error');
                            }
                        },
                        (err) => {
                            console.log(err);
                        }
                    );
                });
           
        }
        else{
            if (!this.salebuy.get('productId').value) {
                this.showSweetAlert('error', 'Ürün Seçimi Yapınız.');
            }
        }
    }

    updateBuySale(): void {}

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
}
