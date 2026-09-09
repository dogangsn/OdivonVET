import { Component, Inject, OnInit } from '@angular/core';
import { TitleDefinationDto } from '../model/titleDefinationDto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { CreateTitleCommand } from '../model/CreateTitleCommand';
import { TitleService } from 'app/core/services/generalsettings/title/title.service';
import { UpdateTitleCommand } from '../model/UpdateTitleCommand';

@Component({
    selector: 'app-create-edit-title',
    templateUrl: './create-edit-title.html',
    styleUrls: ['./create-edit-title.css'],
})
export class CreateEditTitleComponent implements OnInit {
    selectedtitle: TitleDefinationDto;
    title: FormGroup;
    isUpdateButtonActive: Boolean;
    buttonDisabled = false;

    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _translocoService: TranslocoService,
        private _titleService : TitleService,
        @Inject(MAT_DIALOG_DATA) public data: TitleDefinationDto
    ) {
        this.selectedtitle = data;
    }

    ngOnInit() {
        this.title = this._formBuilder.group({
            name: ['', Validators.required],
            remark: ['', Validators.required],
            isAppointmentShow: [false]
        });

        this.fillFormData(this.selectedtitle);
    }

    fillFormData(selectedTile: TitleDefinationDto) {
        if (this.selectedtitle !== null) {
            this.title.setValue({
                name: selectedTile.name,
                remark: selectedTile.remark,
                isAppointmentShow : selectedTile.isAppointmentShow
            });
        }
    }

    addOrUpdateTitle(): void {
        this.buttonDisabled = true;
        this.selectedtitle ? this.updatetitle() : this.addtitle();
    }

    addtitle(): void {
        const titleItem = new CreateTitleCommand(
            this.getFormValueByName('name'),
            this.getFormValueByName('remark'),
            this.getFormValueByName('isAppointmentShow')
        );
        this._titleService.createTitle(titleItem).subscribe(
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

    updatetitle(): void {
        const storeItem = new UpdateTitleCommand(
            this.selectedtitle.id,
            this.getFormValueByName('name'),
            this.getFormValueByName('remark'),
            this.getFormValueByName('isAppointmentShow')
        );
        this._titleService.updateTitle(storeItem).subscribe(
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
        return this.title.get(formName).value;
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
