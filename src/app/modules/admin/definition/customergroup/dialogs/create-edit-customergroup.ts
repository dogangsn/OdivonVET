import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { TranslocoService } from '@ngneat/transloco';
import { CustomerGroupListDto } from '../models/customerGroupListDto';
import { CreateCustomerGroupCommand } from '../models/CreateCustomerGroupCommand';
import { CustomerGroupService } from 'app/core/services/definition/customergroup/customergroup.service';
import { UpdateCustomerGroupCommand } from '../models/UpdateCustomerGroupCommand';

@Component({
    selector: 'app-create-edit-customergroup-dialog',
    styleUrls: ['./create-edit-customergroup.scss'],
    templateUrl: './create-edit-customergroup.html',
})
export class CreateEditCustomerGroupDialogComponent implements OnInit {
    selectedcustomergroup: CustomerGroupListDto;
    productcategory: FormGroup;
    isUpdateButtonActive: Boolean;
    buttonDisabled = false;

    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _customergroup: CustomerGroupService,
        private _translocoService: TranslocoService,
        @Inject(MAT_DIALOG_DATA) public data: CustomerGroupListDto
    ) {
        this.selectedcustomergroup = data;
    }

    ngOnInit(): void {
        this.productcategory = this._formBuilder.group({
            name: ['', Validators.required],
            code: ['', Validators.required]
        });

        this.fillFormData(this.selectedcustomergroup);
    }

    fillFormData(selectedcustomergroup: CustomerGroupListDto) {
        debugger;
        if (this.selectedcustomergroup !== null) {
            this.productcategory.setValue({
                code: selectedcustomergroup.code,
                name: selectedcustomergroup.name,
            });
        }
    }

    addOrUpdateCustomergroup(): void {
        this.buttonDisabled = true;
        this.selectedcustomergroup
            ? this.updatecustomergroup()
            : this.addcustomergroup();
    }

    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }

    addcustomergroup(): void {
        const productCategoryItem = new CreateCustomerGroupCommand( 
            this.getFormValueByName('name'),
            this.getFormValueByName('code')
            );
            
            this._customergroup.createcustomerGroupDef(productCategoryItem).subscribe(
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

    updatecustomergroup(){

        const storeItem = new UpdateCustomerGroupCommand(
            this.selectedcustomergroup.id,
            this.getFormValueByName('code'),
            this.getFormValueByName('name'),
        );

        this._customergroup.updatecustomerGroupDef(storeItem).subscribe(
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
