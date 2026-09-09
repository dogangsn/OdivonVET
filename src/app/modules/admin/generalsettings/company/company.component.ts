import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormGroup,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { companyDto } from './models/companyDto';
import { CompanyService } from 'app/core/services/generalsettings/company/company.service';
import { UpdateCompanyCommand } from './models/updateCompanyCommand';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { TranslocoService } from '@ngneat/transloco';

@Component({
    selector: 'settings-company',
    templateUrl: './company.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsCompanyComponent implements OnInit {
    selectedCompany: companyDto;
    companyForm: FormGroup;
    loader = true;

    constructor(private _formBuilder: UntypedFormBuilder,
                private _companyService: CompanyService,
                private _translocoService: TranslocoService,) {}

    ngOnInit(): void {

        this.getCompany();

        this.companyForm = this._formBuilder.group({
            companyName: [''],
            eMail: [''],
            phone: [''],
            adress: [''],
            companyTitle: [''],
            tradeName: [''],
            taxNumber: [''],
            taxOffice: [''],
            defaultInvoiceType: [0],
            invoiceAmountNotes: [false],
            invoiceNoAutoCreate: [false],
            invoiceSendEMail: [false],
        });

    
    }

    fillFormData(selectedCompany: companyDto) {
        if (this.selectedCompany !== null) {
            this.companyForm.setValue({
                companyName: selectedCompany.companyName,
                eMail: selectedCompany.eMail,
                phone: selectedCompany.phone,
                adress: selectedCompany.adress,
                companyTitle: selectedCompany.companyTitle,
                tradeName: selectedCompany.tradeName,
                taxNumber: selectedCompany.taxNumber,
                taxOffice: selectedCompany.taxOffice,
                defaultInvoiceType: selectedCompany.defaultInvoiceType,
                invoiceAmountNotes: selectedCompany.invoiceAmountNotes,
                invoiceNoAutoCreate: selectedCompany.invoiceNoAutoCreate,
                invoiceSendEMail: selectedCompany.invoiceSendEMail
            });
            this.loader=false
        }
    }


    getCompany(){
        this._companyService.getCompany().subscribe((response) => {
            this.selectedCompany = response.data;
            this.fillFormData(this.selectedCompany);
        });
    }

    getFormValueByName(formName: string): any {
        return this.companyForm.get(formName).value;
    }

    updateCompany(): void {
        const companyItem = new UpdateCompanyCommand(
            this.selectedCompany.id,
            this.getFormValueByName('companyName'),
            this.getFormValueByName('eMail'),
            this.getFormValueByName('phone'),
            this.getFormValueByName('adress'),
            this.getFormValueByName('companyTitle'),
            this.getFormValueByName('tradeName'),
            this.getFormValueByName('taxNumber'),
            this.getFormValueByName('taxOffice'),
            this.getFormValueByName('defaultInvoiceType'),
            this.getFormValueByName('invoiceAmountNotes'),
            this.getFormValueByName('invoiceNoAutoCreate'),
            this.getFormValueByName('invoiceSendEMail'),
        );

        this._companyService.updateCompany(companyItem).subscribe(
            (response) => {
                if (response.isSuccessful) {
                    this.showSweetAlert('success');
         
                } else {
                    this.showSweetAlert('error');
                }
            },
            (err) => {
                console.log(err);
            }
        );
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
        this.companyForm.get('phone').setValue(formattedValue);
    }

    allowOnlyNumbers(event: KeyboardEvent) {
        const pattern = /[0-9]/;
        const inputChar = String.fromCharCode(event.charCode);
    
        if (!pattern.test(inputChar)) {
          event.preventDefault();
        }
      }


}
