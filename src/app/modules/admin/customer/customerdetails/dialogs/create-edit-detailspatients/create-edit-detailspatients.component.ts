import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog'; 
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { TranslocoService } from '@ngneat/transloco';
import { AnimalColorsDefService } from 'app/core/services/definition/animalColorsDef/animalColorsDef.service';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto'; 
import { MatCheckboxChange } from '@angular/material/checkbox'; 
import { v4 as uuidv4 } from 'uuid'; 
import { PatientDetails, SexTYpe } from '../../../models/PatientDetailsCommand';
import { VetAnimalBreedsDefDto } from '../../../models/VetAnimalBreedsDefDto';
import { AnimalColorsDefListDto } from '../../../models/AnimalColorsDefListDto';
import { VetVetAnimalsTypeListDto } from '../../../models/VetVetAnimalsTypeListDto';
import { CreatePatientCommand } from '../../../models/CreatePatientCommand';
import { CreateEditAnimalsColorDialogComponent } from '../../../customeradd/dialog/create-edit-animalscolor';
import { Router } from '@angular/router';

@Component({
    selector: 'app-create-edit-detailspatients',
    templateUrl: './create-edit-detailspatients.component.html',
    styleUrls: ['./create-edit-detailspatients.component.css'],
})
export class CreateEditDetailspatientsComponent implements OnInit {
    selectedPatientDetailsForm: FormGroup;
    selectedpatients: PatientDetails;
    filteredTags: VetAnimalBreedsDefDto[];

    animalcolorDefList: AnimalColorsDefListDto[] = [];
    animalTypesList: VetVetAnimalsTypeListDto[] = [];
    animalBreedsDef: VetAnimalBreedsDefDto[] = [];
    sextype: SexTYpe[];
    counter: number;
    patientSteps: any[] = [];
    tagsEditMode: boolean = false;
    selectedImage: string | ArrayBuffer | null = null;
    buttonDisabled = false;
    patients: PatientDetails;
    saveType: Number = 1;
    selectedCustomerId: any;

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
        debugger;
        this.selectedCustomerId = data.customerId;
        this.selectedpatients = data.selectedpatients;
        this.saveType = data.saveType;
    }

    ngOnInit() {
        debugger;
        this.getAnimalColorsDefList();
        this.getAnimalTypesList();
        this.getAnimalBreedsDefList();
        this.sextype = sextype;

        console.log(this.selectedpatients)
        this.selectedPatientDetailsForm = this._formBuilder.group({
            name: ['', [Validators.required]],
            birthDate: [new Date(), [Validators.required]],
            chipNumber: [''],
            sex: [1, [Validators.required]],
            animalType: ['', [Validators.required]],
            animalColor: [''],
            reportNumber: [''],
            specialNote: [''],
            sterilization: [false],
            images: [[]],
            active: [false],
        });

        this.fillFormData(this.selectedpatients);
    }

    fillFormData(selected: PatientDetails) {
        if (this.selectedpatients !== null) {
            this.selectedPatientDetailsForm.setValue({
                name: selected.name,
                birthDate: selected.birthDate,
                chipNumber: selected.chipNumber,
                sex: selected.sex,
                animalType: selected.animalType,
                animalColor: selected.animalColor,
                reportNumber: selected.reportNumber,
                specialNote: selected.specialNote,
                sterilization: selected.sterilization,
                active: selected.active,
                images: selected.images ?? []
            });
        }
    }

    getAnimalColorsDefList() {
        this._animalColorDefService
            .getAnimalColorsDefList()
            .subscribe((response) => {
                this.animalcolorDefList = response.data;
            });
    }

    getAnimalTypesList() {
        this._customerService.getVetVetAnimalsType().subscribe((response) => {
            this.animalTypesList = response.data;
        });
    }

    getAnimalBreedsDefList() {
        this._customerService.getAnimalBreedsDefList().subscribe((response) => {
            this.animalBreedsDef = response.data;
        });
    }

    addOrUpdatePatients(): void {
        this.buttonDisabled = true;
         this.selectedpatients ? this.addPatients() : this.addPatients();
        // this.selectedpatients ? this.updatePatients() : this.addPatients();
    }

    updatePatients(): void { }


    addPatients(): void {
        debugger;

        this.patients = null;

        
         
        const item: PatientDetails = {
            id: this.saveType == 0 ? uuidv4() : this.selectedpatients.id,
            recId: this.saveType == 0 ? uuidv4() : this.selectedpatients.recId ,
            name: this.selectedPatientDetailsForm.value?.name,
            birthDate: this.selectedPatientDetailsForm.value?.birthDate,
            chipNumber: this.selectedPatientDetailsForm.value?.chipNumber,
            sex: this.selectedPatientDetailsForm.value?.sex,
            animalType: this.selectedPatientDetailsForm.value?.animalType,
            animalBreed: this.selectedPatientDetailsForm.value?.animalBreed,
            animalColor: this.selectedPatientDetailsForm.value?.animalColor,
            reportNumber: this.selectedPatientDetailsForm.value?.reportNumber,
            specialNote: this.selectedPatientDetailsForm.value?.specialNote,
            sterilization: this.selectedPatientDetailsForm.value?.sterilization,
            active: true,
            thumbnail: this.selectedPatientDetailsForm.value?.thumbnail,
            images: [],
        };

        const patientModel = new CreatePatientCommand(
            this.selectedCustomerId,
            item
        );
        if(this.saveType == 1)
        {
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
                                    this.router.navigate([
                                        'customerlist/createvaccine',
                                        response.data,
                                    ]);
                                }
                            }
                        );
                    } else {
                        this.showSweetAlert('error' ,'');
                        this.buttonDisabled = true;
                    }
                },
                (err) => {
                    console.log(err);
                }
            );
        }
        else{
            this._dialogRef.close({ data: item });
        }
        
    }


    showSweetAlert(type: string, message: string): void {
        let sweetAlertDto: SweetAlertDto;

        if (type === 'success') {
            sweetAlertDto = new SweetAlertDto(
                this.translate('sweetalert.success'),
                message || this.translate('sweetalert.transactionSuccessful'),
                SweetalertType.success
            );
        } else {
            sweetAlertDto = new SweetAlertDto(
                this.translate('sweetalert.error'),
                message || this.translate('sweetalert.transactionFailed'),
                SweetalertType.error
            );
        }

        GeneralService.sweetAlert(sweetAlertDto);
    }


    translate(key: string): any {
        return this._translocoService.translate(key);
    }

    onFileSelected(event: any): void {
        const file: File = event.target.files[0];

        if (file) {
            // Resmi okuyun ve görüntülemek için selectedImage değişkenine ata
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.selectedImage = e.target.result;
            };
            reader.readAsDataURL(file);

            // Resmi form verilerine ekleyin (isteğe bağlı)
            this.selectedPatientDetailsForm.patchValue({
                images: [file], // Dosyayı form kontrolüne eklerken bir dizi içine yerleştiriyoruz.
            });
        }
    }

    filterTagsByVendor(selectedVendor: any) {
        debugger;
        const selectedValue = selectedVendor.value;
        this.filteredTags = this.animalBreedsDef.filter(
            (tag) => tag.animaltype == selectedValue
        );

        this.animalBreedsDef.forEach((tag) => {
            tag.isSelected = false;
        });
        // this.selectedPatientDetailsForm.get('animalBreed').setValue(null);
    }

    filterTags(event): void {
        const value = event.target.value.toLowerCase();
        this.filteredTags = this.animalBreedsDef.filter((tag) =>
            tag.breedName.toLowerCase().includes(value)
        );
    }

    filterTagsInputKeyDown(event): void {
        if (event.key !== 'Enter') {
            return;
        }
        if (this.filteredTags.length === 0) {
            //this.createTag(event.target.value);
            event.target.value = '';
            return;
        }
        const tag = this.filteredTags[0];
        // const isTagApplied = this.selectedPatients.tags.find(
        //     (id) => id === tag.id
        // );
        // if (isTagApplied) {
        //     this.removeTagFromProduct(tag);
        // } else {
        //     this.addTagToProduct(tag);
        // }
    }

    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }

    toggleProductTag(
        tag: VetAnimalBreedsDefDto,
        change: MatCheckboxChange
    ): void {
        debugger;
        if (change.checked) {
            this.filteredTags.forEach((tag) => {
                tag.isSelected = false;
            });
            tag.isSelected = true;
            this.selectedPatientDetailsForm
                .get('animalBreed')
                .setValue(tag.recId);
            this.patients.animalBreed = tag.recId;
        } else {
            tag.isSelected = false;
            this.selectedPatientDetailsForm.get('animalBreed').setValue(null);
            this.patients.animalBreed = null;
        }
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
