import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { TranslocoService } from '@ngneat/transloco';
import { suppliersListDto } from '../models/suppliersListDto';
import { CreateSuppliersCommand, InvoiceType } from '../models/CreateSuppliersCommand';
import { SuppliersService } from 'app/core/services/suppliers/suppliers.service';
import { UpdateSuppliersCommand } from '../models/UpdateSuppliersCommand';

@Component({
    selector: 'app-create-edit-suppliers-dialog',
    styleUrls: ['./create-edit-suppliers.scss'],
    templateUrl: './create-edit-suppliers.html',
})
export class CreateEditSuppliersDialogComponent implements OnInit {
    selectedsuppliers: suppliersListDto;
    suppliers: FormGroup;
    isUpdateButtonActive: Boolean;
    buttonDisabled = false;
    states: string[] = ['Kurumsal', 'Bireysel'];

    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _Suppliers: SuppliersService,
        private _translocoService: TranslocoService,
        @Inject(MAT_DIALOG_DATA) public data: suppliersListDto
    ) {
        this.selectedsuppliers = data;
    }

    ngOnInit(): void {
        this.suppliers = this._formBuilder.group({
            suppliername: ['', Validators.required],
            email: ['', Validators.required],
            phone: ['', Validators.required],
            active: [true],
            address : [''],
            selectedState : [this.states[0]],
            companyName : [''], 
            webSite: [''],
            taxOffice : [''],
            taxNumber : ['']

        });
        this.fillFormData(this.selectedsuppliers);
    }
    fillFormData(selectedSuppliers: suppliersListDto) {
 
        if (this.selectedsuppliers !== null) {
            this.suppliers.setValue({
                suppliername: selectedSuppliers.suppliername,
                email: selectedSuppliers.email,
                phone: selectedSuppliers.phone,
                active: selectedSuppliers.active,
                address: selectedSuppliers.adress,
                selectedState: (selectedSuppliers.invoiceType === 1 ? "Kurumsal" : "Bireysel") ,
                companyName : selectedSuppliers.companyName,
                webSite : selectedSuppliers.webSite,
                taxOffice : selectedSuppliers.taxOffice,
                taxNumber : selectedSuppliers.taxNumber
            });
        }
    }
    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }
    addOrUpdateStore(): void {
        this.buttonDisabled = true;
        this.selectedsuppliers
            ? this.updateSupplier()
            : this.addsuppliers();
    }
    updateSupplier(): void {
        const supItem = new UpdateSuppliersCommand(
            this.selectedsuppliers.id,
            this.getFormValueByName('suppliername'),
            this.getFormValueByName('email'),
            this.getFormValueByName('phone'),
            this.getFormValueByName('active'),
            this.getFormValueByName('address'),
            (this.getFormValueByName('selectedState') === "Kurumsal" ? InvoiceType.Institutional : InvoiceType.Individual),
            this.getFormValueByName('companyName'),
            this.getFormValueByName('webSite'),
            this.getFormValueByName('taxOffice'),
            this.getFormValueByName('taxNumber'),
        );

        this._Suppliers.updateSuppliers(supItem).subscribe(
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
    addsuppliers(): void {

        
        const suppliersItem = new CreateSuppliersCommand( 
            this.getFormValueByName('suppliername'),
            this.getFormValueByName('email'),
            this.getFormValueByName('phone'),
            this.getFormValueByName('active'),
            this.getFormValueByName('address'),
            (this.getFormValueByName('selectedState') === "Kurumsal" ? InvoiceType.Institutional : InvoiceType.Individual),
            this.getFormValueByName('companyName'),
            this.getFormValueByName('webSite'),
            this.getFormValueByName('taxOffice'),
            this.getFormValueByName('taxNumber'),
            );

            this._Suppliers.createSuppliers(suppliersItem).subscribe(
                (response) => {
                    
                if (response.isSuccessful) {
                    this.showSweetAlert('success');
                    this._dialogRef.close({
                        status: true,
                    });
                } else {
                     this.showSweetAlert('error');
                     this.buttonDisabled = false;
                }
            },
            (err) => {
                console.log(err);
                this.buttonDisabled = false;
            }
        );

    }

    getFormValueByName(formName: string): any {
        return this.suppliers.get(formName).value;
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
        this.suppliers.get('phone').setValue(formattedValue);
    }


}
