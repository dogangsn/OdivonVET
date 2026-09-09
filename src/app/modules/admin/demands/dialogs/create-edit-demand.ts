import { Component, Inject, OnInit,Input, ChangeDetectorRef   } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { TranslocoService } from '@ngneat/transloco';
import { demandProductsListDto } from '../demand1/models/demandProductsListDto';
import { CreateDemandCommand } from '../models/CreateDemandCommand'; 
import { DemandProductsService } from 'app/core/services/Demands/DemandProducts/demandproducts.service'; 
import { UpdateDemandCommand } from '../models/UpdateDemandCommand';  
import { SuppliersService } from 'app/core/services/suppliers/suppliers.service';
import { suppliersListDto } from '../../suppliers/models/suppliersListDto';
import { demandsListDto } from '../models/demandListDto';
import { ProductDescriptionService } from 'app/core/services/definition/productdescription/productdescription.service';
import { ProductDescriptionsDto } from '../../definition/productdescription/models/ProductDescriptionsDto';
import { Subject, takeUntil } from 'rxjs';

import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
// import { ViewChild } from '@angular/core';
// import { AfterViewInit, ChangeDetectionStrategy,   OnDestroy,  ViewEncapsulation } from '@angular/core';
// import { Observable, debounceTime, map, merge, switchMap } from 'rxjs';
// import { MatPaginator } from '@angular/material/paginator';
// import { MatSort } from '@angular/material/sort';
// import { InventoryBrand, InventoryPagination, InventoryTag, InventoryVendor } from '../../customer/models/PatientDetailsCommand';
// import { FormControl, UntypedFormBuilder, UntypedFormControl, } from '@angular/forms';
// import { FuseConfirmationService } from '@fuse/services/confirmation';
// import { MatCheckboxChange } from '@angular/material/checkbox';
// import { fuseAnimations } from '@fuse/animations';
// import { RepositionScrollStrategy } from '@angular/cdk/overlay';
// import { MatDialog } from '@angular/material/dialog';

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
    selector: 'app-create-edit-demand-dialog',
    styleUrls: ['./create-edit-demand.scss'],
    templateUrl: './create-edit-demand.html',
    styles : [
        /* language=SCSS */
        `
        .inventory-grid {
            grid-template-columns: 48px auto 40px;

            @screen sm {
                grid-template-columns: 48px auto 112px 72px;
            }

            @screen md {
                grid-template-columns: 48px 112px auto 112px 72px;
            }

            @screen lg {
                grid-template-columns: 48px 112px auto 112px 96px 96px 72px 72px;
            }
        }
    `,
    ],
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
export class CreateEditDemandDialogComponent implements OnInit {
    selectedValue;
    selecteddemand: demandProductsListDto;
    demandList: FormGroup;
    isUpdateButtonActive: Boolean;
    demandProductList: demandProductsListDto[] = [];
    isSupplier: boolean;
    supplierscards: suppliersListDto[] = [];
    selectedCustomerId: any = '';
    demandListAll: demandsListDto;
    productsList: demandProductsListDto[] = [];
    productdescription: ProductDescriptionsDto[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    selectedProduct: demandProductsListDto | null = null;
    selectedProductForm: UntypedFormGroup;

    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _demandService: DemandProductsService,
        private _translocoService: TranslocoService,
        private _suppliersService: SuppliersService,
        private productDescriptionService : ProductDescriptionService,
        private cdr: ChangeDetectorRef,
        
        @Inject(MAT_DIALOG_DATA) public data: demandProductsListDto[]
    ) {
        //this.selecteddemand = data;
    }
    ngOnInit(): void {
        debugger;
        this.getProductstedarik();
        this.demandList = this._formBuilder.group({
            date: [new Date(), Validators.required],
            documentno: ['', Validators.required],
            deliverydate: ['', Validators.required],
            note: ['', Validators.required],
            state: [0, Validators.required],
            suppliers:[,Validators.required],
            iscomplated: [true,Validators.required],
            
        });
        this.selectedProductForm = this._formBuilder.group({
            id               : ['', Validators.required],
            productId           : [{value:'',disabled:true}, Validators.required],
            barcode          : ['', Validators.required],
            stockState       : [0],
            reserved         : [0],
            unitPrice        : [0],
            amount           : [0],
            isActive         : [{value:0,disabled:true}],
            quantity         : [0],
        });
        this.getProducts();
        this.demandProductList = this.data;
        debugger;
        this.productsList = this.data;
        //this.demandListAll.demandProductList = this.demandProductList;
        debugger;
       // this.fillFormData(this.selecteddemand);

    }
    getProducts() {
        this.productDescriptionService.GetProductDescriptionList()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response) => {
            if (response && response.data) {
                this.productdescription = response.data;
                this.cdr.markForCheck();                
            }
        });

    }
    getProductstedarik() {
        this._suppliersService.getSuppliersList().subscribe((response) => {
            this.supplierscards = response.data;
            console.log(this.supplierscards);
        });
    }
    addDemandProductList(demandProductsListDtos :demandProductsListDto[]): void {
        debugger;
        this.ngOnInit();
        this.demandProductList = demandProductsListDtos;
    }

    filterCustomerId(value: any): void {
        this.selectedCustomerId = value;
    }

    filterProductId(value: any): void {
        this.selectedCustomerId = value;
    }
    closeDetails(): void
    {
        this.selectedProduct = null;
    }
    toggleDetails(productId: string): void
    {
        debugger;
        // If the product is already selected...
        if ( this.selectedProduct && this.selectedProduct.id === productId )
        {
            // Close the details
            this.closeDetails();
            return;
        }
        // Get the product by id
        var product = this.productsList.find(x=>x.id === productId);
      //   this.demandProductsService.getProductById(productId)
      //       .subscribe((product) => {
      //           // Set the selected product
                 this.selectedProduct = product;
                  
                 this.productsList.filter(x=>x.id === productId);
                 //this.getDemandProducts();
      //           // Fill the form
      debugger;
                 this.selectedProductForm.patchValue(product);
  
      //           // Mark for check
                 this.cdr.markForCheck();
      //       });
    }
    getDemandProducts() {

        this._demandService.getDemandProductsList()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response) => {
            debugger;
            if (response && response.data) {
                // this.productsList = response.data;
                // this.cdr.markForCheck();     
                // console.log(this.productsList);
                // Diğer işlemleri burada gerçekleştirin.
            }
        });

    }
    
    fillFormData(selectedDemand: demandProductsListDto) {
        debugger;
        if (this.selecteddemand !== null) {
            this.demandList.setValue({
                // casename: selectedCase.casename,
                // active: selectedCase.active,
            });
        }
    }
    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }
    addOrUpdateStore(): void {
        this.selecteddemand
            // ? this.updateCase()
            //: 
            this.addDemand();
    }
        // updateCase(): void {
        // const demandItem = new UpdateDemandCommand(
        //     this.selecteddemand.id,
        //     // this.getFormValueByName('casename'),
        //     // this.getFormValueByName('active')
        // );

    //     this._demandService.updateDemand(caseItem).subscribe(
    //         (response) => {
    //             debugger;

    //             if (response.isSuccessful) {
    //                 this.showSweetAlert('success');
    //                 this._dialogRef.close({
    //                     status: true,
    //                 });
    //             } else {
    //                 this.showSweetAlert('error');
    //             }
    //         },
    //         (err) => {
    //             console.log(err);
    //         }
    //     );
    // }
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
    setAgendaPriority(priority): void
    {
        // Set the value
        this.demandList.get('state').setValue(priority);
    }
    controlProperty(): boolean {
        const cdeliverydate = this.getFormValueByName('deliverydate').toLocaleString();
        const cdocumentno = this.getFormValueByName('documentno');
        const csuppliers = this.getFormValueByName('suppliers');
        // const cnote = this.getFormValueByName('note');
        const ccstate = this.getFormValueByName('state');
        if (!cdeliverydate || cdeliverydate === null) {
            const sweetAlertDto = new SweetAlertDto(
                this.translate('sweetalert.error'),
                this.translate('Teslimat Tarihi Giriniz.'),
                SweetalertType.warning
            );
            GeneralService.sweetAlert(sweetAlertDto);
            return false;
        }
        if (!cdocumentno || cdocumentno === null) {
            const sweetAlertDto = new SweetAlertDto(
                this.translate('sweetalert.error'),
                this.translate('Döküman No Giriniz.'),
                SweetalertType.warning
            );
            GeneralService.sweetAlert(sweetAlertDto);
            return false;
        }
        if (!csuppliers || csuppliers === null) {
            const sweetAlertDto = new SweetAlertDto(
                this.translate('sweetalert.error'),
                this.translate('Tedarikçi Giriniz.'),
                SweetalertType.warning
            );
            GeneralService.sweetAlert(sweetAlertDto);
            return false;
        }
        // if (!cnote || cnote === null) {
        //     const sweetAlertDto = new SweetAlertDto(
        //         this.translate('sweetalert.error'),
        //         this.translate('Not Giriniz.'),
        //         SweetalertType.warning
        //     );
        //     GeneralService.sweetAlert(sweetAlertDto);
        //     return false;
        // }
        if (!ccstate || ccstate === null) {
            const sweetAlertDto = new SweetAlertDto(
                this.translate('sweetalert.error'),
                this.translate('Durum Giriniz.'),
                SweetalertType.warning
            );
            GeneralService.sweetAlert(sweetAlertDto);
            return false;
        }
        return true;

    }
    addDemand(): void {
        debugger;
        if(!this.controlProperty())
        {
            return;
        }
        debugger;
        const rowdate = this.getFormValueByName('date').toLocaleString();
        const rowdeliverydate = this.getFormValueByName('deliverydate').toLocaleString();
        // const formattedDate = new Date(rowdate).toISOString();
        // const formattedDeliveryDate = new Date(rowdeliverydate).toISOString();
        const filterDemandProductList = this.demandProductList.filter(x=>x.selected === true);
        if(filterDemandProductList.length === 0)
        {
            const sweetAlertDto = new SweetAlertDto(
                this.translate('sweetalert.error'),
                this.translate('Lütfen en az 1 tane Talep Seçiniz.'),
                SweetalertType.warning
            );
            GeneralService.sweetAlert(sweetAlertDto);
            return;
        }
        //const demandItem = null;
        debugger;
        const demandItem = new CreateDemandCommand( 
            this.getFormValueByName('date'),
            this.getFormValueByName('documentno'),
            this.getFormValueByName('suppliers'),
            this.getFormValueByName('deliverydate'),
            this.getFormValueByName('note'),
            this.getFormValueByName('state'),
            false,
            filterDemandProductList
            );
            this._demandService.createDemands(demandItem).subscribe(
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
    onCheckboxChange(productId: string) {
       const productCheck = this.productsList.find(x=>x.id === productId);
       productCheck.selected = productCheck.selected === true ? false : true;
    }
    
    getFormValueByName(formName: string): any {
        return this.demandList.get(formName).value;
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
