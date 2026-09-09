import { Component, Inject, OnInit } from '@angular/core';
import { ProductDescriptionsDto } from '../models/ProductDescriptionsDto';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { CreateProductDescriptionsCommand } from '../models/CreateProductDescriptionsCommand';
import { ProductDescriptionService } from 'app/core/services/definition/productdescription/productdescription.service';
import { UpdateProductDescriptionsCommand } from '../models/UpdateProductDescriptionsCommand';
import { CustomerGroupListDto } from '../../customergroup/models/customerGroupListDto';
import { CustomerGroupService } from 'app/core/services/definition/customergroup/customergroup.service';
import { UnitsService } from 'app/core/services/definition/unitdefinition/units.service';
import { unitdefinitionListDto } from '../../unitdefinition/models/unitdefinitionListDto';
import { ProductCategoriesListDto } from '../../productcategory/models/ProductCategoriesListDto';
import { ProductCategoryService } from 'app/core/services/definition/ProductCategories/productcategory.service';
import { SuppliersService } from 'app/core/services/suppliers/suppliers.service';
import { suppliersListDto } from 'app/modules/admin/suppliers/models/suppliersListDto';
import { ProductType } from 'app/modules/bases/enums/producttype.enum';
import { CustomNumericValidator } from 'app/modules/bases/CustomNumericValidator';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { VetVetAnimalsTypeListDto } from 'app/modules/admin/customer/models/VetVetAnimalsTypeListDto';
import { StoreService } from 'app/core/services/store/store.service';
import { StoreListDto } from 'app/modules/admin/store/models/StoreListDto';
import { TaxisService } from 'app/core/services/definition/taxis/taxis.service';
import { TaxesDto } from '../../taxes/models/taxesDto';
import { Observable, Subject, takeUntil, zip } from 'rxjs';

@Component({
    selector: 'app-create-edit-productdescription-dialog',
    styleUrls: ['./create-edit-productdescription.scss'],
    templateUrl: './create-edit-productdescription.html',
})
export class CreateEditProductDescriptionDialogComponent implements OnInit {
    selectedProductdescription: ProductDescriptionsDto;
    productdescription: FormGroup;
    units: unitdefinitionListDto[] = [];
    productcategories: ProductCategoriesListDto[] = [];
    supplierscards: suppliersListDto[] = [];
    animalTypesList: VetVetAnimalsTypeListDto[] = [];

    selectedValue: string;
    producttype: number;
    visibleProductType: boolean;
    mapproducttype: { name: string; id: number }[] = [];
    isInvalidPrice: boolean;
    buttonDisabled = false;
    storeList: StoreListDto[] = [];
    taxisList: TaxesDto[] = [];

    destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _translocoService: TranslocoService,
        private _productDefService: ProductDescriptionService,
        private _unitsservice: UnitsService,
        private _productcategoryservice: ProductCategoryService,
        private _suppliersService: SuppliersService,
        private _customerService: CustomerService,
        private _storeservice: StoreService,
        private _taxisService: TaxisService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.producttype = data.producttype;
        this.visibleProductType = data.visibleProductType;
        this.selectedProductdescription = data.selectedProductdescription;
    }

    ngOnInit(): void {
        
        for (var n in ProductType) {
            if (typeof ProductType[n] === 'number') {
                this.mapproducttype.push({ id: <any>ProductType[n], name: n });
            }
        }

        zip(
            this.getTaxisList()

        ).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (value) => {
                this.setTaxis(value[0])
            },
            error: (e) => {
                console.log(e);
            },
            complete: () => {
                this.fillFormData(this.selectedProductdescription);

            }
        });
 
        this.UnitsList();
        this.ProductCategoryList();
        this.getSuppliers();
        this.getStoreList();

        if (this.visibleProductType) {
            this.getAnimalTypesList();
        }

        this.productdescription = this._formBuilder.group({
            name: ['', [Validators.required]],
            unitId: ['00000000-0000-0000-0000-000000000000', [this.producttype===1||this.producttype===2?Validators.required:Validators.nullValidator]],
            categoryId: ['00000000-0000-0000-0000-000000000000'],
            productTypeId: { value: this.producttype, disabled: true },
            supplierId: ['00000000-0000-0000-0000-000000000000'],
            productBarcode: [''],
            productCode: [''],
            buyingPrice: [0, [this.producttype===1||this.producttype===2?Validators.required:Validators.nullValidator, CustomNumericValidator()]],
            sellingPrice: [0, [Validators.required]],
            criticalAmount: [0],
            active: [true],
            sellingIncludeKDV: [false],
            buyingIncludeKDV: [false],
            fixPrice: [false],
            isExpirationDate: [false],
            animalType: [],
            numberRepetitions: [],
            storeid: ['00000000-0000-0000-0000-000000000000', this.producttype===1||this.producttype===2?Validators.required:Validators.nullValidator],
            taxisId: ['00000000-0000-0000-0000-000000000000']
        });

    }

    UnitsList() {
        this._unitsservice.getUnitsList().subscribe((response) => {
            this.units = response.data;
            console.log(this.units);
        });
    }

    ProductCategoryList() {
        this._productcategoryservice
            .getProductCategoryList()
            .subscribe((response) => {
                this.productcategories = response.data;
                console.log(this.productcategories);
            });
    }

    getSuppliers() {
        this._suppliersService.getSuppliersList().subscribe((response) => {
            this.supplierscards = response.data;
            console.log(this.supplierscards);
        });
    }

    getStoreList() {
        this._storeservice.getStoreList().subscribe((response) => {
            this.storeList = response.data;
        });
    }

    fillFormData(selectedproductdesf: ProductDescriptionsDto) {
        if (this.selectedProductdescription !== null) {
            this.productdescription.setValue({
                name: selectedproductdesf.name,
                unitId: selectedproductdesf.unitId,
                categoryId: selectedproductdesf.categoryId,
                productTypeId: selectedproductdesf.productTypeId,
                supplierId: selectedproductdesf.supplierId,
                productBarcode: selectedproductdesf.productBarcode,
                productCode: selectedproductdesf.productCode,
                buyingPrice: selectedproductdesf.buyingPrice,
                sellingPrice: selectedproductdesf.sellingPrice,
                criticalAmount: selectedproductdesf.criticalAmount,
                active: selectedproductdesf.active,
                sellingIncludeKDV: selectedproductdesf.sellingIncludeKDV,
                buyingIncludeKDV: selectedproductdesf.buyingIncludeKDV,
                fixPrice: selectedproductdesf.fixPrice,
                isExpirationDate: selectedproductdesf.isExpirationDate,
                animalType: selectedproductdesf.animalType,
                numberRepetitions: selectedproductdesf.numberRepetitions,
                storeid: selectedproductdesf.storeId,
                taxisId: selectedproductdesf.taxisId
            });
        }
    }

    addOrUpdateProductDef(): void {
        this.buttonDisabled = true;
        this.selectedProductdescription
            ? this.updateProductDef()
            : this.addProductDef();
    }

    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }

    addProductDef(): void {
        debugger
        const ProductDefItem = new CreateProductDescriptionsCommand(
            this.getFormValueByName('name'),
            this.getFormValueByName('unitId'),
            this.getFormValueByName('categoryId'),
            this.getFormValueByName('productTypeId'),
            this.getFormValueByName('supplierId'),
            this.getFormValueByName('productBarcode'),
            this.getFormValueByName('productCode'),
            this.getFormValueByName('buyingPrice'),
            this.getFormValueByName('sellingPrice'),
            this.getFormValueByName('criticalAmount'),
            this.getFormValueByName('active'),
            this.getFormValueByName('sellingIncludeKDV'),
            this.getFormValueByName('buyingIncludeKDV'),
            this.getFormValueByName('fixPrice'),
            this.getFormValueByName('isExpirationDate'),
            this.getFormValueByName('animalType'),
            this.getFormValueByName('numberRepetitions'),
            this.getFormValueByName('storeid'),
            this.getFormValueByName('taxisId'),
        );

        if (this.validateControl(ProductDefItem)) {
            this.buttonDisabled = false;
            return;
        }

        this._productDefService
            .createProductDescription(ProductDefItem)
            .subscribe(
                (response) => {
                    debugger;

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

    updateProductDef() {
        const storeItem = new UpdateProductDescriptionsCommand(
            this.selectedProductdescription.id,
            this.getFormValueByName('name'),
            this.getFormValueByName('unitId'),
            this.getFormValueByName('categoryId'),
            this.getFormValueByName('productTypeId'),
            this.getFormValueByName('supplierId'),
            this.getFormValueByName('productBarcode'),
            this.getFormValueByName('productCode'),
            this.getFormValueByName('buyingPrice'),
            this.getFormValueByName('sellingPrice'),
            this.getFormValueByName('criticalAmount'),
            this.getFormValueByName('active'),
            this.getFormValueByName('sellingIncludeKDV'),
            this.getFormValueByName('buyingIncludeKDV'),
            this.getFormValueByName('fixPrice'),
            this.getFormValueByName('isExpirationDate'),
            this.getFormValueByName('animalType'),
            this.getFormValueByName('numberRepetitions'),
            this.getFormValueByName('storeid'),
            this.getFormValueByName('taxisId'),
        );
debugger
        this._productDefService.updateProductDescription(storeItem).subscribe(
            (response) => {
                debugger;

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
        return this.productdescription.get(formName).value;
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

    validateControl(model: any): boolean {

        debugger;
        if (this.producttype!==3) {
            if (model.buyingPrice <= 0) {
                this.showSweetAlert(
                    'error',
                    'Alış Fiyatı 0(Sıfırdan) Büyük olmalıdır.'
                );
                return true;
            }
            if (model.ratio <= 0) {
                this.showSweetAlert(
                    'error',
                    'KDV Oranı 0(Sıfırdan) Büyük olmalıdır.'
                );
                return true;
            }
            if (model.storeId == null || model.storeId == undefined || model.storeId == '00000000-0000-0000-0000-000000000000') {
                this.showSweetAlert("error", 'Depo Seçimi Zorunludur.');
                return true;
            }
        }
       
        if (model.sellingPrice <= 0) {
            this.showSweetAlert(
                'error',
                'Satış Fiyatı 0(Sıfırdan) Büyük olmalıdır.'
            );
            return true;
        }
        return false;
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

    getAnimalTypesList() {
        this._customerService.getVetVetAnimalsType().subscribe((response) => {
            this.animalTypesList = response.data;
            console.log('anımals', this.animalTypesList);
        });
    }

    getTaxisList(): Observable<any> {
        return this._taxisService.getTaxisList();
    }

    setTaxis(response: any): void {
        if (response.data) {
            this.taxisList = response.data;
        }
    }

  


}
