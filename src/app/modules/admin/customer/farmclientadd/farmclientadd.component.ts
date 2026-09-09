import { Component, OnInit } from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PatientDetails } from '../models/PatientDetailsCommand';
import { PatientDetailsDto } from '../models/PatientDetailsDto';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { CustomerDetailDto } from '../models/CustomerDetailDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { TranslocoService } from '@ngneat/transloco';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { FarmsDto } from '../models/FarmsDto';
import { CreateEditDetailspatientsComponent } from '../customerdetails/dialogs/create-edit-detailspatients/create-edit-detailspatients.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-farmclientadd',
    templateUrl: './farmclientadd.component.html',
    styleUrls: ['./farmclientadd.component.css'],
})
export class FarmclientaddComponent implements OnInit {
    horizontalStepperForm: UntypedFormGroup;
    items = [
        {
            title: 'Öğe 1',
            description: 'Bu, kart listesinin birinci öğesi.'
        },
        {
            title: 'Öğe 2',
            description: 'Bu, kart listesinin ikinci öğesi.'
        },
        {
            title: 'Öğe 3',
            description: 'Bu, kart listesinin üçüncü öğesi.'
        },
        {
            title: 'Öğe 4',
            description: 'Bu, kart listesinin üçüncü öğesi.'
        },
        {
            title: 'Öğe 5',
            description: 'Bu, kart listesinin üçüncü öğesi.'
        },
        {
            title: 'Öğe 6',
            description: 'Bu, kart listesinin üçüncü öğesi.'
        }
        // Buraya istediğiniz kadar öğe ekleyebilirsiniz
    ];
    patientDetails: PatientDetailsDto[] = [];
    patientList: PatientDetails[] = [];
    patientSaveList: PatientDetailsDto[] = [];


    constructor(private _formBuilder: UntypedFormBuilder,
        private _customerService: CustomerService,
        private _translocoService: TranslocoService,
        private _dialog: MatDialog,
        private router: Router,
    ) {

    }

    ngOnInit() {
        this.horizontalStepperForm = this._formBuilder.group({
            step1: this._formBuilder.group({
                farmName: ['', [Validators.required]],
                farmContact: ['', Validators.required],
                farmRelationship: ['', Validators.required],
            }),
            step2: this._formBuilder.group({
                firstName: ['', Validators.required],
                lastName: ['', Validators.required],
                email: ['',  [Validators.email]],
                phoneNumber: ['',Validators.required],
                note: [''],
            }),
            step3: this._formBuilder.group({
                byEmail: this._formBuilder.group({
                    animalColor: 0,
                    // companyNews: [true],
                    // featuredProducts: [false],
                    // messages: [true],
                }),
                pushNotifications: ['everything', Validators.required],
            }),
        });
    }


    formatPhoneNumber(inputValue: string, formControlName: string): void {
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
        this.horizontalStepperForm.get('step2.phoneNumber').setValue(formattedValue);
    }

    addPanelOpen(): void {
        debugger;
        const model = {
            customerId: '00000000-0000-0000-0000-000000000000',
            selectedpatients: null,
            saveType: 0
        }
        //this.erpfinancemonitorForm.reset();
        const dialog = this._dialog
            .open(CreateEditDetailspatientsComponent, {
                // maxWidth: '400vw !important',
                maxWidth: '100vw !important',
                disableClose: true,
                data: model,
            })
            .afterClosed()
            .subscribe((response) => {
                if (response != null) {
                    debugger;
                    // if (response.status) {
                    if (response.data != null) {
                        this.patientDetails.push(response.data)
                    }
                    // debugger;
                    // response.data.forEach(item => {
                    //     this.patients.push(item);
                    // });
                    // this.dataSource = new MatTableDataSource(this.patients);
                    // }
                }

            });
    }
    saveLayout() {
        debugger;
        if (this.patientDetails.length == 0) {
            this.showSweetAlert('error', 'Lütfen Hasta Giriniz.!');
            return;
        }
        const sweetAlertDto = new SweetAlertDto(
            this.translate('sweetalert.areYouSure'),
            this.translate('sweetalert.farmAddAreSure'),
            SweetalertType.warning
        );
        GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
            (swalResponse) => {
                if (swalResponse.isConfirmed) {

                    const farmList: FarmsDto = {
                        farmName: this.horizontalStepperForm.get('step1.farmName').value,
                        farmContact: this.horizontalStepperForm.get('step1.farmContact').value,
                        farmRelationship: this.horizontalStepperForm.get('step1.farmRelationship').value,
                        active: true,
            
                    };
                    const patientSaveDetails = this.patientDetails;
                    const CreateCustomers: CustomerDetailDto = {
                        id: '00000000-0000-0000-0000-000000000000',
                        firstname: this.horizontalStepperForm.get('step2.firstName').value,
                        lastname: this.horizontalStepperForm.get('step2.lastName').value,
                        phonenumber: this.horizontalStepperForm.get('step2.phoneNumber').value,
                        email: this.horizontalStepperForm.get('step2.email').value,
                        note: this.horizontalStepperForm.get('step2.note').value,
                        recid : '',
                        phonenumber2: '',
                        taxoffice: '',
                        vkntcno: '',
                        customergroup: '',
                        discountrate: 0,
                        isemail: false,
                        isphone: false,
                        adressid: '',
                        createdate: '',
                        city: '',
                        district: '',
                        longadress: '',
            
                        FarmsDetail: farmList,
                        patientDetails: patientSaveDetails
            
            
            
            
                    }
            
                    const model = {
                        CreateCustomers: CreateCustomers
                    }
            
                    this._customerService.createCustomers(model).subscribe(
                        (response) => {
            
                            if (response.isSuccessful) {
                                this.showSweetAlert('success','Kayıt İşlemi Gerçekleşti');
                                // this._AgendaListComponent.visible = true;
                                debugger
                              
                                   
                                        this.router.navigate([
                                            'customerlist/customerdetails',
                                            response.data,
                                        ]);
                                    
                                
                            } else {
                                this.showSweetAlert('error',response.errors[0]);
                            }
                        },
                        (err) => {
                            console.log(err);
                        }
                    );
                }});
        


    }
    showSweetAlert(type: string, text: string): void {
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
                this.translate(text),
                SweetalertType.error
            );
            GeneralService.sweetAlert(sweetAlertDto);
        }
    }
    translate(key: string): any {
        return this._translocoService.translate(key);
    }
    public redirectToDeletePatient = (id: string) => {
        const sweetAlertDto = new SweetAlertDto(
            this.translate('sweetalert.areYouSure'),
            this.translate('sweetalert.areYouSureDelete'),
            SweetalertType.warning
        );
        GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
            (swalResponse) => {
                if (swalResponse.isConfirmed) {
                    debugger;
                    this.patientDetails = this.patientDetails.filter(x => x.recId != id);
                }
            }
        );
    }
    public redirectToUpdatePatient = (id: string) => {

        const selectedPatients = this.patientDetails.find((item) => item.recId == id);
        if (selectedPatients) {
            const model = {
                customerId: '00000000-0000-0000-0000-000000000000',
                selectedpatients: selectedPatients,
                saveType: 2
            }
            console.log(model);
            const dialog = this._dialog
                .open(CreateEditDetailspatientsComponent, {
                    maxWidth: '100vw !important',
                    disableClose: true,
                    data: model
                })
                .afterClosed()
                .subscribe((response) => {
                    if (response != null) {
                        debugger;
                        // if (response.status) {
                        if (response.data != null) {
                            const findAnimal = this.patientDetails.find(x => x.recId == response.data.recId);
                            if (findAnimal != null) {
                                this.patientDetails = this.patientDetails.filter(x => x.recId != response.data.recId)
                                this.patientDetails.push(response.data)
                            }

                        }
                        // debugger;
                        // response.data.forEach(item => {
                        //     this.patients.push(item);
                        // });
                        // this.dataSource = new MatTableDataSource(this.patients);
                        // }
                    }
                    // if (response.status) {
                    //     //  this.getCustomerDetailList();
                    // }
                });
        }
    }

}
