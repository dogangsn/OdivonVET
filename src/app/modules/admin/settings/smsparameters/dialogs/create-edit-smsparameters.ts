import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { TranslocoService } from '@ngneat/transloco';
import { StoreService } from 'app/core/services/store/store.service';
import { SmsParametersDto } from '../models/smsParameterDto';
import { ParametersService } from 'app/core/services/settings/parameters.service';
import { CreateSmsParametersCommand } from '../models/createSmsParametersCommand';
import { UpdateSmsParametersCommand } from '../models/updateSmsParametersCommand';

@Component({
    selector: 'app-create-edit-smsparameters',
    styleUrls: ['./create-edit-smsparameters.scss'],
    templateUrl: './create-edit-smsparameters.html',
})
export class CreateEditSmsParameterDialogComponent implements OnInit {
    selectedsmsparameters : SmsParametersDto;
    buttonDisabled = false;
    smsparameters: FormGroup;
    smsintegrationtype: number;

    constructor(        
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _translocoService: TranslocoService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _parametersService: ParametersService,
    ) 
    {
        this.selectedsmsparameters = data.selectedsmsparameters;
        this.smsintegrationtype = data.smsparameterstype;
    }

    ngOnInit(): void {

        
        this.smsparameters = this._formBuilder.group({
            active: [true],
            username : ['', Validators.required],
            password: ['', Validators.required],
        });
        this.fillFormData(this.selectedsmsparameters);
    }
 
    fillFormData(selected: SmsParametersDto) {
 
        if (this.selectedsmsparameters !== null && this.selectedsmsparameters !== undefined) {
            this.smsparameters.setValue({
                active: selected.active,
                username: selected.userName,
                password: selected.password
            });
        }
    }

    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }
    
    addOrUpdateSmsParameter(): void {
        this.buttonDisabled = true;
        this.selectedsmsparameters
            ? this.updatesmsparameter()
            : this.addsmsparameter();
    }

    addsmsparameter(): void {

        const item = new CreateSmsParametersCommand(
            this.getFormValueByName('active'),
            this.getFormValueByName('username'),
            this.getFormValueByName('password'),
            this.smsintegrationtype
        );

        this._parametersService.createSmsParameters(item).subscribe(
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

    updatesmsparameter(): void {
        const item = new UpdateSmsParametersCommand(
            this.selectedsmsparameters.id,
            this.getFormValueByName('active'),
            this.getFormValueByName('username'),
            this.getFormValueByName('password'),
            this.smsintegrationtype
        );

        this._parametersService.updateSmsParameters(item).subscribe(
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
        return this.smsparameters.get(formName).value;
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