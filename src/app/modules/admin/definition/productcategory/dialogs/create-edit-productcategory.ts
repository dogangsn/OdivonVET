import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductCategoriesListDto } from '../models/ProductCategoriesListDto';
import { CreateProductCategoriesCommand } from '../models/CreateProductCategoriesCommand';
import { ProductCategoryService } from 'app/core/services/definition/ProductCategories/productcategory.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { TranslocoService } from '@ngneat/transloco';
import { UpdateProductCategoriesCommand } from '../models/UpdateProductCategoriesCommand';

@Component({
    selector: 'app-create-edit-productcategory-dialog',
    styleUrls: ['./create-edit-productcategory.scss'],
    templateUrl: './create-edit-productcategory.html',
})
export class CreateEditProductCategoriesDialogComponent implements OnInit {
    selectedproductcategory: ProductCategoriesListDto;
    productcategory: FormGroup;
    isUpdateButtonActive: boolean;
    visibleProductType: boolean;
    buttonDisabled = false;

    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _productcategory: ProductCategoryService,
        private _translocoService: TranslocoService,
        @Inject(MAT_DIALOG_DATA) public data: ProductCategoriesListDto
    ) { 
        this.selectedproductcategory = data;
    }

    ngOnInit(): void {
        this.productcategory = this._formBuilder.group({
            name: ['', Validators.required],
            categoryCode: ['', Validators.required]
        });

         this.fillFormData(this.selectedproductcategory);

    }

     fillFormData(selectedcustomergroup: ProductCategoriesListDto) {
            if (this.selectedproductcategory !== null) {
                this.productcategory.setValue({
                    name: selectedcustomergroup.name,
                    categoryCode: selectedcustomergroup.categoryCode,
                });
            }
        }
 
    addproductcategories(): void {

        const productCategoryItem = new CreateProductCategoriesCommand( 
            this.getFormValueByName('name'),
            this.getFormValueByName('categoryCode')
            );
            this._productcategory.createProductCategory(productCategoryItem).subscribe(
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

    addOrUpdateproductcategories(): void {
        this.buttonDisabled = true;
        this.selectedproductcategory
            ? this.updateproductcategories()
            : this.addproductcategories();
    }

    updateproductcategories(): void {
        const item = new UpdateProductCategoriesCommand(
            this.selectedproductcategory.id,
            this.getFormValueByName('name'),
            this.getFormValueByName('categoryCode'),
        );

        this._productcategory.updateProductCategory(item).subscribe(
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

    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }

    getFormValueByName(formName: string): any {
        return this.productcategory.get(formName).value;
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
