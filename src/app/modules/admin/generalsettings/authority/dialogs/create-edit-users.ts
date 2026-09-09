import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { TranslocoService } from '@ngneat/transloco';
import { UserListDto } from '../models/UserListDto';
import { CreateUserCommand } from '../models/CreateUserCommand';
import { UsersService } from 'app/core/services/settings/users/users.service';
import { RolsService } from 'app/core/services/generalsettings/rols/rols.service';
import { RoleSettingDto } from '../../rolDef/models/RoleSettingDto';
import { TitleService } from 'app/core/services/generalsettings/title/title.service';
import { TitleDefinationDto } from '../../title/model/titleDefinationDto';
import { UpdateUserCommand } from '../models/UpdateUserCommand';

@Component({
    selector: 'app-create-edit-users-dialog',
    styleUrls: ['./create-edit-users.scss'],
    templateUrl: './create-edit-users.html',
})
export class CreateEditUsersDialogComponent implements OnInit {
    selectedusers: UserListDto;
    users: FormGroup;
    isUpdateButtonActive: Boolean;

    rols: RoleSettingDto[] = [];
    title: TitleDefinationDto[] = [];

    unvanListesi: string[] = [
        'Bay',
        'Bayan',
        'Dr.',
        'Prof.',
        'Yüksek Mühendis',
        'Uzman',
        // ...diğer ünvanlar
      ];

    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _translocoService: TranslocoService,
        private _usersService: UsersService,
        private _rolsSettings : RolsService,
        private _titleService : TitleService,
        @Inject(MAT_DIALOG_DATA) public data: UserListDto
    ) {
        this.selectedusers = data;
    }

    ngOnInit(): void {
        this.getRolsist();
        this.getTileList();
        this.users = this._formBuilder.group({
            active: [true],
            firstLastName: [''],
            email: ['', Validators.required],
            phone: [''],
            appKey : [''],
            roleId : ['',  Validators.required],
            titleid: ['']
        });
        this.fillFormData(this.selectedusers);
    }

    fillFormData(selectedUsers: UserListDto) {
        debugger;
        if (this.selectedusers !== null) {
            this.users.setValue({
                active: selectedUsers.active,
                email: selectedUsers.email,
                firstLastName: selectedUsers.firstName,
                phone: selectedUsers.phone,
                roleId: selectedUsers.roleId,
                appKey: selectedUsers.appKey,
                titleid: selectedUsers.titleId,
            });
        }
    }

    getTileList(): void {
        this._titleService.getTitleList().subscribe((response) => {
            this.title = response.data;
            console.log(response.data);
        });
    }

    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }

    addOrUpdateUsers(): void {
        this.selectedusers ? this.updateUsers() : this.addUsers();
    }

    updateUsers(): void {
        const user = new UpdateUserCommand();
        user.active = this.getFormValueByName('active');
        user.email = this.getFormValueByName('email');
        user.firstName = this.getFormValueByName('firstLastName');
        user.phone = this.getFormValueByName('phone');
        user.appKey = this.getFormValueByName('appKey');
        user.roleId = this.getFormValueByName('roleId');
        user.titleId = this.getFormValueByName('titleid');
        user.userName = user.email;
        user.userId = this.selectedusers.id;


        this._usersService.updateUser(user).subscribe(
            (response) => {
                debugger;

                if (response.isSuccessful) {
                    this.showSweetAlert('success', 'sweetalert.transactionSuccessful');
                    this._dialogRef.close({
                        status: true,
                    });
                } else {

                    this.showSweetAlert('error', response);
                }
            },
            (err) => {
                console.log(err);
            }
        );
    }

    addUsers(): void {
        debugger;
        const user = new CreateUserCommand();
        user.active = this.getFormValueByName('active');
        user.email = this.getFormValueByName('email');
        user.firstName = this.getFormValueByName('firstLastName');
        user.phone = this.getFormValueByName('phone');
        user.appKey = this.getFormValueByName('appKey');
        user.roleId = this.getFormValueByName('roleId');
        user.titleId = this.getFormValueByName('titleid');
        user.userName = user.email;

        this._usersService.addUser(user).subscribe(
            (response) => {
                debugger;
                if (response.isSuccessful) {
                    this.showSweetAlert('success', 'sweetalert.transactionSuccessful');
                    this._dialogRef.close({
                        status: true,
                    });
                } else {
                    debugger;
                    let errMessage = "";
                    if(response.errors.length > 0){
                        errMessage = response.errors[0];
                    }else{
                        errMessage = 'sweetalert.transactionFailed';
                    }
                    this.showSweetAlert('error', errMessage);
                }
            },
            (err) => {
                console.log(err);
            }
        );
    }

    getFormValueByName(formName: string): any {
        return this.users.get(formName).value;
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
    
    getRolsist(): void {
        this._rolsSettings.getRolSettings().subscribe((response) => {
            this.rols = response.data;
        });
    }

    formatPhoneNumber(inputValue: string): void {
        // Sadece sayıları alarak filtreleme yapın
        const numericValue = inputValue.replace(/\D/g, '');
    
        // Sayıları uygun formatta düzenle
        let formattedValue = '';
        if (numericValue.length > 0) {
            formattedValue += '(' + numericValue.substring(0, 3) + ')';
        }
        if (numericValue.length > 3) {
            formattedValue += ' ' + numericValue.substring(3, 6);
        }
        if (numericValue.length > 6) {
            formattedValue += '-' + numericValue.substring(6, 10);
        }
    
        // Düzenlenmiş değeri input alanına atayın
        this.users.get('phone').setValue(formattedValue);
    }
}
