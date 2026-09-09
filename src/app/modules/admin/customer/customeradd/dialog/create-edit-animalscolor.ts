import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { TranslocoService } from '@ngneat/transloco';
import { SuppliersService } from 'app/core/services/suppliers/suppliers.service';
import { AnimalColorsDefListDto } from '../../models/AnimalColorsDefListDto';
import { CreateAnimalColorsDefCommand } from '../../models/CreateAnimalColorsDefCommand';
import { AnimalColorsDefService } from 'app/core/services/definition/animalColorsDef/animalColorsDef.service';

@Component({
    selector: 'app-create-edit-animalscolor',
    styleUrls: ['./create-edit-animalscolor.css'],
    templateUrl: './create-edit-animalscolor.html',
})
export class CreateEditAnimalsColorDialogComponent implements OnInit {
    selectedanimalColors: AnimalColorsDefListDto;
    animalcolors: FormGroup;
    isUpdateButtonActive: Boolean;
    buttonDisabled = false;

    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _translocoService: TranslocoService,
        private _animalColorDefService: AnimalColorsDefService,
        @Inject(MAT_DIALOG_DATA) public data: AnimalColorsDefListDto
    ) {
        this.selectedanimalColors = data;
    }

    ngOnInit(): void {
        this.animalcolors = this._formBuilder.group({
            name: ['', Validators.required],
        });
        this.fillFormData(this.selectedanimalColors);
    }
    fillFormData(selectedSuppliers: AnimalColorsDefListDto) {
        debugger;
        if (this.selectedanimalColors !== null) {
            this.animalcolors.setValue({
                name: selectedSuppliers.name,
            });
        }
    }
    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }
    addOrUpdateAnimalColors(): void {
        this.buttonDisabled = true;
        this.selectedanimalColors
            ? this.updateAnimalColors()
            : this.addAnimalColors();
    }

    updateAnimalColors(): void {
        // const supItem = new UpdateSuppliersCommand(
        //     this.selectedanimalColors.id,
        //     this.getFormValueByName('suppliername'),
        //     this.getFormValueByName('email'),
        //     this.getFormValueByName('phone'),
        //     this.getFormValueByName('active')
        // );
        // this._Suppliers.updateSuppliers(supItem).subscribe(
        //     (response) => {
        //         debugger;
        //         if (response.isSuccessful) {
        //             this.showSweetAlert('success');
        //             this._dialogRef.close({
        //                 status: true,
        //             });
        //         } else {
        //             this.showSweetAlert('error');
        //         }
        //     },
        //     (err) => {
        //         console.log(err);
        //     }
        // );
    }

    addAnimalColors(): void {
        const item = new CreateAnimalColorsDefCommand(
            this.getFormValueByName('name')
        );
        debugger;
        this._animalColorDefService.createCreateAnimalColorsDef(item).subscribe(
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
        return this.animalcolors.get(formName).value;
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
