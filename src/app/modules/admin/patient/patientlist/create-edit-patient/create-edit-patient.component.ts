import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { AnimalColorsDefService } from 'app/core/services/definition/animalColorsDef/animalColorsDef.service';
import { GeneralService } from 'app/core/services/general/general.service';
import { CreateEditAnimalsColorDialogComponent } from 'app/modules/admin/customer/customeradd/dialog/create-edit-animalscolor';
import { AnimalColorsDefListDto } from 'app/modules/admin/customer/models/AnimalColorsDefListDto';
import { SexTYpe } from 'app/modules/admin/customer/models/PatientDetailsCommand';
import { VetAnimalBreedsDefDto } from 'app/modules/admin/customer/models/VetAnimalBreedsDefDto';
import { VetVetAnimalsTypeListDto } from 'app/modules/admin/customer/models/VetVetAnimalsTypeListDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';

@Component({
  selector: 'app-create-edit-patient',
  templateUrl: './create-edit-patient.component.html',
  styleUrls: ['./create-edit-patient.component.css']
})
export class CreateEditPatientComponent implements OnInit {

  selectedpatients: any;
  patientDetailsForm: FormGroup;

  animalcolorDefList: AnimalColorsDefListDto[] = [];
  animalTypesList: VetVetAnimalsTypeListDto[] = [];
  animalBreedsDef: VetAnimalBreedsDefDto[] = [];
  sextype: SexTYpe[];

  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    private _translocoService: TranslocoService,
    private _animalColorDefService: AnimalColorsDefService,
    private _customerService: CustomerService,
    private _dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

  getAnimalColorsDefList() {
    this._animalColorDefService
      .getAnimalColorsDefList()
      .subscribe((response) => {
        this.animalcolorDefList = response.data;
      });
  }



  addPanelOpen(): void {
    const dialog = this._dialog
      .open(CreateEditAnimalsColorDialogComponent, {
        maxWidth: '100vw !important',
        disableClose: true,
        data: null,
      })
      .afterClosed()
      .subscribe((response) => {
        if (response.status) {
          this.getAnimalColorsDefList();
        }
      });

  }

  closeDialog(): void {
    this._dialogRef.close({ status: null });
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
