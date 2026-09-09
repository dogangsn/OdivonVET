import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
    NgForm,
    Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoService } from '@ngneat/transloco';
import { AccountService } from 'app/core/services/account/account.service';
import { AuthService } from 'app/core/services/auth/auth.service';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';

@Component({
    selector: 'auth-sign-up',
    templateUrl: './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class AuthSignUpComponent implements OnInit {
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signUpForm: UntypedFormGroup;
    showAlert: boolean = false;
    passwordErrors: string[] = [];

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _accountService: AccountService,
        private _translocoService: TranslocoService,
        private _fuseConfirmationService: FuseConfirmationService
    ) {}

    ngOnInit(): void {
        // Create the form
        this.signUpForm = this._formBuilder.group({
            username: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
            password: ['', Validators.required],
            company: [''],
            agreements: ['', Validators.required],
        });
    }

    signUp(): void {
        debugger;

        this.passwordErrors = this.validatePassword(this.getFormValueByName('password'));
        if(this.passwordErrors.length > 0){
            const errorMessage = this.passwordErrors.join('\n');
            this.showSweetAlert('error', errorMessage);
            return;
        }


        if (this.signUpForm.valid) {
            var model = {
                email: this.getFormValueByName('email'),
                company: this.getFormValueByName('company'),
                username: this.getFormValueByName('username'),
                Password: this.getFormValueByName('password'),
                Phone: this.getFormValueByName('phone'),
                host: window.location.host,
            };
            this.signUpForm.disable();
            this.showAlert = false;

            this._accountService.createaccount(model).subscribe(
                (response) => {
                    if(response.isSuccessful) {
                        localStorage.setItem('email', model.email);
                        localStorage.setItem('phone', model.Phone);
                        this._router.navigateByUrl('auth/confirmation-required');
                    }else
                    {
                        this.signUpForm.enable();
                        this.signUpNgForm.resetForm();
                        this.alert = {
                            type: 'error',
                            message: 'E-posta Adresi Zaten Alınmış.',
                        };
                        this.showAlert = true;
                    }
                }
            );
        } else {
            if (!this.signUpForm.get('agreements').value) {
                this.showSweetAlert(
                    'error',
                    'KULLANIM KOŞULLARINI KABUL EDNİNİZ.'
                );
            } else {
                this.showSweetAlert(
                    'error',
                    'Lütfen zorunlu alanları doldurunuz.'
                );
            }
        }
    }

    getFormValueByName(formName: string): any {
        return this.signUpForm.get(formName).value;
    }

    showSweetAlert(type: string, text: string): void {
        if (type === 'success') {
            const sweetAlertDto = new SweetAlertDto(
                this.translate('sweetalert.success'),
                text,
                SweetalertType.success
            );
            GeneralService.sweetAlert(sweetAlertDto);
        } else {
            const sweetAlertDto = new SweetAlertDto(
                this.translate('sweetalert.error'),
                text,
                SweetalertType.error
            );
            GeneralService.sweetAlert(sweetAlertDto);
        }
    }

    translate(key: string): any {
        return this._translocoService.translate(key);
    }

    openTermsDialog(): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Hükümler',
            message:
                'Are you sure you want to remove this product? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Kabul',
                },
            },
        });
        // const dialogRef = this._dialog.open(YourTermsDialogComponent, {
        //     width: '500px', // Dialog penceresi genişliği
        //     data: { /* İletmek istediğiniz verileri burada geçebilirsiniz */ }
        // });

        // Dialog kapatıldığında yapılacak işlemler
        confirmation.afterClosed().subscribe((result) => {
            // Burada dialog kapatıldığında yapılacak işlemleri yapabilirsiniz
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
        this.signUpForm.get('phone').setValue(formattedValue);
    }

    onPasswordChange(): void {
        const password = this.signUpForm.get('password').value;
        this.passwordErrors = this.validatePassword(password);
    }

    validatePassword(password: string): string[] {
        const errors: string[] = [];

        if (!/[a-z]/.test(password)) {
            errors.push('Şifre küçük harf içermelidir.');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Şifre büyük harf içermelidir.');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Şifre rakam içermelidir.');
        }
        if (!/[^A-Za-z0-9]/.test(password)) {
            errors.push('Şifre özel karakter içermelidir.');
        }
        if (password.length < 8) {
            errors.push('Şifre en az 8 karakter uzunluğunda olmalıdır.');
        }
        return errors;
    }
}
