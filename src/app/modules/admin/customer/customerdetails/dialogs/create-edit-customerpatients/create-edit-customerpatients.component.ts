import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnimalColorsDefListDto } from '../../../models/AnimalColorsDefListDto';
import { VetVetAnimalsTypeListDto } from '../../../models/VetVetAnimalsTypeListDto';
import { VetAnimalBreedsDefDto } from '../../../models/VetAnimalBreedsDefDto';
import { PatientDetails, SexTYpe } from '../../../models/PatientDetailsCommand';
import { CreateEditAnimalsColorDialogComponent } from '../../../customeradd/dialog/create-edit-animalscolor';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { AnimalColorsDefService } from 'app/core/services/definition/animalColorsDef/animalColorsDef.service';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { v4 as uuidv4 } from 'uuid';
import { CreatePatientCommand } from '../../../models/CreatePatientCommand';
import { PatientDetailsDto } from '../../../models/PatientDetailsDto';
import { Observable, Subject, takeUntil, zip } from 'rxjs';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { Router } from '@angular/router';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'DDD MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'DDD MMMM YYYY',
  },
};


@Component({
  selector: 'app-create-edit-customerpatients',
  templateUrl: './create-edit-customerpatients.component.html',
  styleUrls: ['./create-edit-customerpatients.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    {
      provide: MAT_DATE_FORMATS, useValue: MY_FORMATS
    },
  ],
})
export class CreateEditCustomerpatientsComponent implements OnInit {

  selectedpatients: PatientDetailsDto;
  patientDetailsForm: FormGroup;

  animalcolorDefList: AnimalColorsDefListDto[] = [];
  animalTypesList: VetVetAnimalsTypeListDto[] = [];
  animalBreedsDef: VetAnimalBreedsDefDto[] = [];
  sextype: SexTYpe[];

  filteredAnimalBreed: VetAnimalBreedsDefDto[];
  buttonDisabled = false;
  selectedCustomerId: any;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    private _translocoService: TranslocoService,
    private _animalColorDefService: AnimalColorsDefService,
    private _customerService: CustomerService,
    private _dialog: MatDialog,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.sextype = sextype;
    this.selectedCustomerId = data.customerId;
    this.selectedpatients = data.selectedPatients;
  }

  ngOnInit() {


    zip(
      this.getAnimalColorsDefList(),
      this.getAnimalTypesList(),
      this.getAnimalBreedsDefList()
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          this.setAnimalColorsDefList(value[0]),
            this.setAnimalTypesList(value[1]),
            this.setAnimalBreedsDefList(value[2])
        },
        error: (e) => {
          console.log(e);
        },
        complete: () => {
          this.fillFormData(this.selectedpatients);
        },
      });



    this.patientDetailsForm = this._formBuilder.group({
      id: [''],
      name: ['', [Validators.required]],
      birthDate: [''],
      chipNumber: [''],
      sex: [1],
      animalType: [0],
      animalBreed: [],
      animalColor: [0],
      reportNumber: [''],
      specialNote: [''],
      sterilization: [],
    });


  }

  fillFormData(selectedpatient: PatientDetailsDto) {

    if (this.selectedpatients !== null && this.selectedpatients !== undefined) {
      this.patientDetailsForm.setValue({
        id: selectedpatient.id,
        name: selectedpatient.name,
        birthDate: selectedpatient.birthDate,
        chipNumber: selectedpatient.chipNumber,
        sex: selectedpatient.sex,
        animalType: selectedpatient.animalType,
        animalBreed: selectedpatient.animalBreed,
        animalColor: selectedpatient.animalColorId,
        reportNumber: selectedpatient.reportNumber,
        specialNote: selectedpatient.specialNote,
        sterilization: selectedpatient.sterilization
      });
      this.filterTagsByVendor(selectedpatient.animalType);
    }
  }

  filterTagsByVendor(selectedVendor: any) {

    const selectedValue = this.selectedpatients ? selectedVendor : selectedVendor.value;
    this.filteredAnimalBreed = this.animalBreedsDef.filter(
      (tag) => tag.animaltype == selectedValue
    );
    this.animalBreedsDef.forEach((tag) => {
      tag.isSelected = false;
    });
    // this.selectedPatientDetailsForm.get('animalBreed').setValue(null);
    // this.selectedPatients.animalBreed = null;
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
          // this.getAnimalColorsDefList();
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

  addOrUpdatePatients(): void {
    this.buttonDisabled = true;
    this.selectedpatients ? this.updatePatients() : this.addPatients();
  }

  addPatients(): void {

    const item: PatientDetails = {
      id: uuidv4(),
      recId: uuidv4(),
      name: this.patientDetailsForm.value?.name,
      birthDate: this.patientDetailsForm.value?.birthDate,
      chipNumber: this.patientDetailsForm.value?.chipNumber,
      sex: this.patientDetailsForm.value?.sex,
      animalType: this.patientDetailsForm.value?.animalType,
      animalBreed: this.patientDetailsForm.value?.animalBreed,
      animalColor: this.patientDetailsForm.value?.animalColor,
      reportNumber: this.patientDetailsForm.value?.reportNumber,
      specialNote: this.patientDetailsForm.value?.specialNote,
      sterilization: this.patientDetailsForm.value?.sterilization,
      active: true,
      thumbnail: '',
      images: [],
    };
    const patientModel = new CreatePatientCommand(
      this.selectedCustomerId,
      item
    );

    this._customerService.createPatients(patientModel).subscribe(
      (response) => {
        if (response.isSuccessful) {
          const sweetAlertDto = new SweetAlertDto(
              'Kayıt İşlemi Gerçekleşti',
              'Aşı Kayıt Ekranına yönlendirileceksiniz!',
              SweetalertType.success
          );
          GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
              (swalResponse) => {
                  if (swalResponse.isConfirmed) {
                    this._dialogRef.close();
                      this.router.navigate([
                          'customerlist/createvaccine',
                          response.data,
                      ]);
                  }
              }
          );
      } else {
          this.showSweetAlert('error');
          this.buttonDisabled = true;
      }
      },
      (err) => {
        console.log(err);
      }
    );

  }

  updatePatients(): void {
    const item: PatientDetails = {
      recId: uuidv4(),
      id: this.patientDetailsForm.value?.id,
      name: this.patientDetailsForm.value?.name,
      birthDate: this.patientDetailsForm.value?.birthDate,
      chipNumber: this.patientDetailsForm.value?.chipNumber,
      sex: this.patientDetailsForm.value?.sex,
      animalType: this.patientDetailsForm.value?.animalType,
      animalBreed: this.patientDetailsForm.value?.animalBreed,
      animalColor: this.patientDetailsForm.value?.animalColor,
      reportNumber: this.patientDetailsForm.value?.reportNumber,
      specialNote: this.patientDetailsForm.value?.specialNote,
      sterilization: this.patientDetailsForm.value?.sterilization,
      active: true,
      thumbnail: '',
      images: [],
    };
    const patientModel = new CreatePatientCommand(
      this.selectedCustomerId,
      item
    );

    this._customerService.updatePatient(patientModel).subscribe(
      (response) => {
        if (response.isSuccessful) {
          this.showSweetAlert('success');
          this._dialogRef.close({
            status: true,
          });
        } else {
          this.showSweetAlert('error');
          this.buttonDisabled = true;
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getAnimalColorsDefList(): Observable<any> {
    return this._animalColorDefService.getAnimalColorsDefList();
  };

  setAnimalColorsDefList(response: any): void {
    if (response.data) {
      this.animalcolorDefList = response.data;
    }
  }

  getAnimalTypesList(): Observable<any> {
    return this._customerService.getVetVetAnimalsType();
  };

  setAnimalTypesList(response: any): void {
    if (response.data) {
      this.animalTypesList = response.data;
    }
  }

  getAnimalBreedsDefList(): Observable<any> {
    return this._customerService.getAnimalBreedsDefList()
  };

  setAnimalBreedsDefList(response: any): void {
    if (response.data) {
      this.animalBreedsDef = response.data;
    }
  }

}


export const sextype = [
  {
    id: 1,
    parentId: null,
    name: 'Erkek',
    slug: 'Erkek',
  },
  {
    id: 2,
    parentId: null,
    name: 'Dişi',
    slug: 'Dişi',
  },
];