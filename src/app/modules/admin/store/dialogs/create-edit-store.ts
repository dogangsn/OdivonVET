import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { TranslocoService } from '@ngneat/transloco';
import { StoreListDto } from '../models/StoreListDto';
import { CreateStoreCommand } from '../models/CreateStoreCommand';
import { StoreService } from 'app/core/services/store/store.service';
import { UpdateStoreCommand } from '../models/UpdateStoreCommand';

@Component({
    selector: 'app-create-edit-store-dialog',
    styleUrls: ['./create-edit-store.scss'],
    templateUrl: './create-edit-store.html',
})
export class CreateEditStoreDialogComponent implements OnInit {
    selectedstore: StoreListDto;
    store: FormGroup;
    isUpdateButtonActive: Boolean;
    buttonDisabled = false;

    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _translocoService: TranslocoService,
        private _storeservice: StoreService,
        @Inject(MAT_DIALOG_DATA) public data: StoreListDto
    ) {
        this.selectedstore = data;
    }

    ngOnInit(): void {
        this.store = this._formBuilder.group({
            depotCode: ['', Validators.required],
            depotName: ['', Validators.required],
            active: [true],
        });

        this.fillFormData(this.selectedstore);
    }

    fillFormData(selectedStore: StoreListDto) {
        debugger;
        if (this.selectedstore !== null) {
            this.store.setValue({
                depotCode: selectedStore.depotCode,
                depotName: selectedStore.depotName,
                active: selectedStore.active,
            });
        }
    }

    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }

    addOrUpdateStore(): void {
        this.buttonDisabled = true;
        this.selectedstore
            ? this.updatestore()
            : this.addstore();
    }

    addstore(): void {
        const storeItem = new CreateStoreCommand(
            this.getFormValueByName('depotCode'),
            this.getFormValueByName('depotName'),
            this.getFormValueByName('active')
        );

        this._storeservice.createStores(storeItem).subscribe(
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

    updatestore(): void {
        const storeItem = new UpdateStoreCommand(
            this.selectedstore.id,
            this.getFormValueByName('depotCode'),
            this.getFormValueByName('depotName'),
            this.getFormValueByName('active')
        );

        this._storeservice.updateStores(storeItem).subscribe(
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
        return this.store.get(formName).value;
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
