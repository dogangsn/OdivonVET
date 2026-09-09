import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { TitleService } from 'app/core/services/generalsettings/title/title.service';
import { MailingService } from 'app/core/services/generalsettings/mailing/mailing.service';
import { SmtpSettingsDto } from '../models/smtpSettingsDto';
import { CreateSmtpSettingCommand } from '../models/CreateSmtpSettingCommand';
import { UpdateSmtpSettingCommand } from '../models/UpdateSmtpSettingCommand';

@Component({
    selector: 'app-create-edit-smtpmailsettings',
    templateUrl: './create-edit-smtpmailsettings.html',
    styleUrls: ['./create-edit-smtpmailsettings.css'],
})
export class CreateEditSmstSettingComponent implements OnInit {
    selectedsmtpsetting: SmtpSettingsDto;
    smtpsetting: FormGroup;

    isUpdateButtonActive: Boolean;
    buttonDisabled = false;

    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _translocoService: TranslocoService,
        private _maileService : MailingService,
        @Inject(MAT_DIALOG_DATA) public data: SmtpSettingsDto
    ) {
        this.selectedsmtpsetting = data;
    }

    ngOnInit() {
        this.smtpsetting = this._formBuilder.group({
            defaults: [false],
            displayName: ['', Validators.required],
            emailId: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            host: ['', Validators.required],
            useSSL: [false],
            port: ['', Validators.pattern("^[0-9]*$")] // Sadece sayı kabul eden form kontrolü
          });
        this.fillFormData(this.selectedsmtpsetting);
    }

    fillFormData(selectedSmtpSeting: SmtpSettingsDto) {
        if (this.selectedsmtpsetting !== null) {
            this.smtpsetting.setValue({
                defaults: selectedSmtpSeting.defaults,
                displayName: selectedSmtpSeting.displayName,
                emailId: selectedSmtpSeting.emailId,
                password : selectedSmtpSeting.password,
                host: selectedSmtpSeting.host,
                useSSL : selectedSmtpSeting.useSSL,
                port : selectedSmtpSeting.port
            });
        }
    }

    addOrUpdateSmtpSetting(): void {
        this.buttonDisabled = true;
        this.selectedsmtpsetting ? this.updateSmtpSetting() : this.addMailSmtp();
    }

    addMailSmtp(): void {
        const item = new CreateSmtpSettingCommand(
            this.getFormValueByName('defaults'),
            this.getFormValueByName('displayName'),
            this.getFormValueByName('emailId'),
            this.getFormValueByName('password'),
            this.getFormValueByName('host'),
            this.getFormValueByName('port'),
            this.getFormValueByName('useSSL'),
        );
        this._maileService.createMailSettings(item).subscribe(
            (response) => {
                debugger;
                if (response.isSuccessful) {
                    this.showSweetAlert('success', 'sweetalert.transactionSuccessful');
                    this._dialogRef.close({
                        status: true,
                    });
                } else {
                    this.buttonDisabled = false;
                    this.showSweetAlert('error', response.data);
                }   
            },
            (err) => {
                console.log(err);
            }
        );
    }

    updateSmtpSetting(): void {
        const item = new UpdateSmtpSettingCommand(
            this.selectedsmtpsetting.id,
            this.getFormValueByName('defaults'),
            this.getFormValueByName('displayName'),
            this.getFormValueByName('emailId'),
            this.getFormValueByName('password'),
            this.getFormValueByName('host'),
            this.getFormValueByName('port'),
            this.getFormValueByName('useSSL'),
        );
        this._maileService.updateMailSettings(item).subscribe(
            (response) => {
                debugger;
                if (response.isSuccessful) {
                    this.showSweetAlert('success', 'sweetalert.transactionSuccessful');
                    this._dialogRef.close({
                        status: true,
                    });
                } else {
                    this.showSweetAlert('error', response.data);
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
        return this.smtpsetting.get(formName).value;
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
}
