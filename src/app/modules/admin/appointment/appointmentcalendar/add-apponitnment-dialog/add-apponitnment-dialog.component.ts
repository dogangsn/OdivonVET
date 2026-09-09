
import { CustomerService } from '../../../../../core/services/customers/customers.service';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogRef,
} from '@angular/material/dialog';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { customersListDto } from 'app/modules/admin/customer/models/customersListDto';
import { AppointmentDto } from '../models/appointmentDto';
import { AppointmentService } from 'app/core/services/appointment/appointment.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { TranslocoService } from '@ngneat/transloco';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { AppointmentTypeDto } from '../models/appointmentTypeDto';
import { VetUsersDto } from '../models/vetusersDto';
import { CreateAppointmentCommand } from '../models/createAppointmentCommand';
import { ProductDescriptionService } from 'app/core/services/definition/productdescription/productdescription.service';
import { ProductDescriptionsDto } from 'app/modules/admin/definition/productdescription/models/ProductDescriptionsDto';
import { addVaccineDto } from '../models/addVaccineDto';
import { v4 as uuidv4 } from 'uuid';
import { PatientDetails } from 'app/modules/admin/customer/models/PatientDetailsCommand';
import { AppointmentTypeservice } from 'app/core/services/definition/appointmenttypes/appointmenttypes.service';
import { AppointmentTypesDto } from 'app/modules/admin/definition/appointmenttypes/models/appointmentTypesDto';
import { VaccineService } from 'app/core/services/definition/vaccinelist/vaccinelist.service';
import { VaccineListDto } from 'app/modules/admin/definition/vaccinelist/models/vaccineListDto';
import { Observable, Subject, takeUntil, zip } from 'rxjs';
import { ParametersService } from 'app/core/services/settings/parameters.service';
import { parametersListDto } from 'app/modules/admin/settings/parameters/models/parametersListDto';
import { UpdateAppointmentCommand } from '../models/updateAppointmentCommand';
import { EditorStyle, LabelMode } from 'devextreme-angular/common';

@Component({
    selector: 'app-add-apponitnment-dialog',
    templateUrl: './add-apponitnment-dialog.component.html',
    styleUrls: ['./add-apponitnment-dialog.component.css'],
})
export class AddApponitnmentDialogComponent implements OnInit {

    stylingMode: EditorStyle = 'outlined';

    appointmentAdd: FormGroup;
    selectedCustomer: string;
    selectedDoctor: string;
    customers: customersListDto[] = [];
    appointment: AppointmentDto;
    selectedAppointmentType: number;
    selectedAppointmentForm: FormGroup;
    addVaccineList: addVaccineDto[] = [];
    vetDoctorList: VetUsersDto[] = [];
    patientList: PatientDetails[] = [];
    selectedAppointment: AppointmentDto;
    appointmentTypes: AppointmentTypesDto[] = [];
    visibleCustomer: boolean;
    now: Date = new Date();
    lastSelectedValue: Date = new Date();
    timeValue: Date | null = null;

    selectedCustomerId: any;
    selectedPatientId: any;
    selectedVaccine: UntypedFormGroup;
    selectedVaccineId: any;

    morning8 = new Date();
    evening8 = new Date();
    today = new Date();

    statusTypeList = Object.keys(StatusTypeValues).map(key => ({ value: +key, label: StatusTypeValues[key] }));
    selectedStatus: number | null = null;
    vaccine: VaccineListDto[] = [];
    destroy$: Subject<boolean> = new Subject<boolean>();
    parameters: parametersListDto[] = [];
    buttonDisabled: boolean = false;
    controlDate = new Date();
    loader = true;
    isVaccine = false;

    datetimestatus: number;
    appointmentinterval: number;
    dateType: 'date' | 'datetime' = 'datetime';

    _isSaveControl = true;

    constructor(
        private _formBuilder: FormBuilder,
        private _dialogRef: MatDialogRef<any>,
        private _customerService: CustomerService,
        private _appointmentService: AppointmentService,
        private _translocoService: TranslocoService,
        private _appointmenttypesService: AppointmentTypeservice,
        private _vaccineService: VaccineService,
        private _parameterService: ParametersService,
        private cdr: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        if (!this.visibleCustomer) {
            if (data.patinetlist !== undefined && data.patinetlist !== null) {
                this.patientList = data.patinetlist;
            }
        }
        
        if (data.selectedAppointment != null) {
            this.selectedAppointment = data.selectedAppointment;
            this.selectedCustomerId = data.customerId;
            this.selectedPatientId = data.patientId;
            this.visibleCustomer = data.visibleCustomer;
            if (this.selectedAppointment.appointmentType === 1) {
                this.selectedVaccineId = data.selectedAppointment.vaccineItems[0].id;
            }
        }else if(data!==undefined && data!==null && data.customerId !== undefined)
        {
            this.selectedCustomerId = data.customerId;
        }
         else {
            this.visibleCustomer = true;
        }
        this.isVaccine = (data.isVaccine === null || data.isVaccine === undefined ? false : data.isVaccine);

        this.morning8.setHours(8, 0, 0, 0);
        this.evening8.setHours(20, 0, 0, 0);
        this._parameterService.getparameterList().subscribe((response) => {

            this.parameters = response.data;
            const [beginHours, beginMinutes] = this.parameters[0].appointmentBeginDate.split(':').map(Number);
            this.morning8.setHours(beginHours);
            this.morning8.setMinutes(beginMinutes);

            const [endHours, endMinutes] = this.parameters[0].appointmentEndDate.split(':').map(Number);
            this.evening8.setHours(endHours);
            this.evening8.setMinutes(endMinutes);

            this.datetimestatus = this.parameters[0].datetimestatus;
            this.appointmentinterval = this.parameters[0].appointmentinterval;

            this.dateType = this.parameters[0].datetimestatus === 1 ? 'date' : 'datetime';
            this.cdr.detectChanges();

        });

    }

    timeIntervals: any = {
        type: 'time',
        interval: 60,
        min: this.morning8,
        max: this.evening8
    };

    ngOnInit() {

        zip(
            this.getVaccineList(),
            this.getAppointmentTypeList(),
            this.getCustomerList(),
            this.getApponitmentDoctorList(),
            this.asyncgetParameter()
        ).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (value) => {
                this.setVaccineList(value[0]),
                    this.setAppointmentTypeList(value[1]),
                    this.setCustomerList(value[2]),
                    this.setApponitmentDoctorList(value[3]),
                    this.setasyncgetParameter(value[4])
            },
            error: (e) => {
                console.log(e);
            },
            complete: () => {
                this.fillFormData(this.selectedAppointment);

                this.dateType = this.parameters[0].datetimestatus === 1 ? 'date' : 'datetime';
                this.cdr.detectChanges();

                this.loader = false;
            }
        });

        this.appointmentAdd = this._formBuilder.group(this.selectedAppointment && this.selectedAppointment.appointmentType === 1 ? {
            doctorId: ['00000000-0000-0000-0000-000000000000'],
            appointmentType: [2, Validators.required],
            customerId: [''],
            patientId: [''],
            note: [''],
            status: [1],
            selectedVaccineId: ['']
        } : {
            doctorId: ['00000000-0000-0000-0000-000000000000'],
            appointmentType: [2, Validators.required],
            customerId: [''],
            patientId: [''],
            note: [''],
            status: [1],
        });

        if (!this.selectedAppointment) {
            this.selectedStatus = 1;
        }

        const newId = uuidv4();
        const model: addVaccineDto = {
            id: newId,
            date: this.now,
            isComplated: false,
            productId: '00000000-0000-0000-0000-000000000000',
        };
        this.addVaccineList.push(model);

        if (this.selectedPatientId != null) {

            this.handleCustomerChange(this.selectedCustomerId)
            // this.appointmentAdd.get('patientId').patchValue(this.selectedPatientId);
        }

        // this.fillFormData(this.selectedAppointment);



    }

    getCustomerList(): Observable<any> {
        let model = {
            IsArchive : false
        }
        return this._customerService.getcustomerlist(model);
    }

    setCustomerList(response: any): void {
        if (response.data) {
            this.customers = response.data;
        }
    }

    getVaccineList(): Observable<any> {
        const model = {
            AnimalType: 0
        };

        return this._vaccineService
            .getVaccineList(model);
    }

    setVaccineList(response: any): void {
        if (response.data) {
            this.vaccine = response.data;
        }
    }

    getAppointmentTypeList(): Observable<any> {
        return this._appointmenttypesService.getAppointmentTypes();
    }

    setAppointmentTypeList(response: any): void {
        if (response.data) {
            this.appointmentTypes = response.data;
            if (this.isVaccine) {
                this.appointmentTypes = this.appointmentTypes.filter(type => type.type === 1);
                if (this.appointmentTypes.length > 0) {
                    this.appointmentAdd.get('appointmentType').setValue(this.appointmentTypes[0].type);
                }
            }
        }
    }

    getApponitmentDoctorList(): Observable<any> {
        return this._appointmentService.getUserTitleList();
    }

    setApponitmentDoctorList(response: any): void {
        if (response.data) {
            debugger
            this.vetDoctorList = response.data;
        }
    }

    getPatientList() {
        debugger
        this._customerService.getPatientsByCustomerId(this.customers[0].id).subscribe((response) => {
            this.patientList = response.data;
        });
    }

    handleCustomerChange(event: any) {
        const model = {
            id: event.value
        }
        if (model.id == undefined) {
            model.id = event;
        }

        debugger;
        this._customerService.getPatientsByCustomerId(model).subscribe((response) => {
            this.patientList = response.data;
            if (this.patientList.length === 1) {
                this.appointmentAdd.get('patientId').patchValue(this.patientList[0].id);
            }
        });
    }

    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }

    getFormValueByName(formName: string): any {
        return this.appointmentAdd.get(formName).value;
    }

    addOrUpdateAppointment(): void {

        const sweetAlertDto = new SweetAlertDto(
            this.translate('sweetalert.areYouSure'),
            this.translate('sweetalert.apponitnmentAreSure'),
            SweetalertType.warning
        );
        GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
            (swalResponse) => {
                if (swalResponse.isConfirmed) {
                    this.selectedAppointment ? this.updateAppointment() : this.addAppointment();
                }
            }
        );
    }

    addAppointment(): void {

        let _isSave = true;

        if (this.datetimestatus === 1) {
            const combinedDateTime = new Date(this.lastSelectedValue);
            combinedDateTime.setHours(this.timeValue.getHours());
            combinedDateTime.setMinutes(this.timeValue.getMinutes());
            this.lastSelectedValue = combinedDateTime;
        }

        const item = new CreateAppointmentCommand(
            this.lastSelectedValue,
            ((this.getFormValueByName('doctorId') === undefined || this.getFormValueByName('doctorId') === null) ? '00000000-0000-0000-0000-000000000000' : this.getFormValueByName('doctorId')),
            (this.visibleCustomer == true ? this.getFormValueByName('customerId') : this.selectedCustomerId),
            this.getFormValueByName('note'),
            this.getFormValueByName('appointmentType'),
            this.selectedStatus,
            this.getFormValueByName('patientId'),
            this.addVaccineList
        );
        if (this.validateControl(item.appointmentType)) {
            this.buttonDisabled = false;
            return;
        }


        zip(
            this.isAppointmentControlDate(this.lastSelectedValue)
        ).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (value) => {
                this.setAppointmentControlDate(value[0])
            },
            error: (e) => {
                console.log(e);
            },
            complete: () => {
                
                if (!this._isSaveControl) {
         
                    const sweetAlertDto = new SweetAlertDto(
                        this.translate('sweetalert.areYouSure'),
                        this.translate('Sistem üzerinde aynı randevu saatlerine kayıt bulunmaktadır. Yinede kayıt edilsin mi?'),
                        SweetalertType.warning
                    );
                    GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
                        (swalResponse) => {
                            if (!swalResponse.isConfirmed) {
                                _isSave = false;
                            }else{
                                this._appointmentService.createAppointment(item).subscribe(
                                    (response) => { 
                                        if (response.isSuccessful) {
                                            this.showSweetAlert('success', 'sweetalert.transactionSuccessful');
                                            this._dialogRef.close({
                                                status: true,
                                            });
                                        } else {
                                            this.showSweetAlert('error', 'sweetalert.transactionFailed');
                                        }
                                    },
                                    (err) => {
                                        console.log(err);
                                    }
                                );
                            }
                        }
                    )
                    
                }
                else
                {
                    this._appointmentService.createAppointment(item).subscribe(
                        (response) => { 
                            if (response.isSuccessful) {
                                this.showSweetAlert('success', 'sweetalert.transactionSuccessful');
                                this._dialogRef.close({
                                    status: true,
                                });
                            } else {
                                this.showSweetAlert('error', 'sweetalert.transactionFailed');
                            }
                        },
                        (err) => {
                            console.log(err);
                        }
                    );
                }
            }
        });
    }

    



    updateAppointment(): void {

        if (this.datetimestatus === 1) {
            const combinedDateTime = new Date(this.lastSelectedValue);
            combinedDateTime.setHours(this.timeValue.getHours());
            combinedDateTime.setMinutes(this.timeValue.getMinutes());
            this.lastSelectedValue = combinedDateTime;
        }

        const item = new UpdateAppointmentCommand(
            this.selectedAppointment.id,
            this.lastSelectedValue,
            ((this.getFormValueByName('doctorId') === undefined || this.getFormValueByName('doctorId') === null) ? '00000000-0000-0000-0000-000000000000' : this.getFormValueByName('doctorId')),
            (this.visibleCustomer == true ? this.getFormValueByName('customerId') : this.selectedCustomerId),
            this.getFormValueByName('note'),
            this.getFormValueByName('appointmentType'),
            this.selectedStatus,
            this.getFormValueByName('patientId'),
            this.addVaccineList
        );
        if (this.validateControl(item.appointmentType)) {
            this.buttonDisabled = false;
            return;
        }
        this._appointmentService.updateAppointment(item).subscribe(
            (response) => {
                debugger;

                if (response.isSuccessful) {
                    this.showSweetAlert('success', 'sweetalert.transactionSuccessful');
                    this._dialogRef.close({
                        status: true,
                    });
                } else {
                    this.showSweetAlert('error', 'sweetalert.transactionFailed');
                }
            },
            (err) => {
                console.log(err);
            }
        );
    }

    validateControl(appointmentType:number): boolean {

        if(this.addVaccineList.length > 0 && appointmentType === 1 ) {
            let _control = false;
            this.addVaccineList.forEach(x => {
                if(x.date <= this.morning8 || x.date.getHours() > this.evening8.getHours()) {
                    _control = true;
                }
            });
            if(_control) {
                this.showSweetAlert(
                    'error',
                    'Randevu saatleri uygun değil!'
                );
                return true;
            }
        }else{
            if (this.lastSelectedValue <= this.morning8 || this.lastSelectedValue.getHours() > this.evening8.getHours()) {
                this.showSweetAlert(
                    'error',
                    'Randevu saatleri uygun değil!'
                );
                return true;
            }
        }



     
        return false;
    }

    addVaccine() {
        const newId = uuidv4();
        const model: addVaccineDto = {
            id: newId,
            date: this.now,
            isComplated: false,
            productId: '00000000-0000-0000-0000-000000000000',
        };
        this.addVaccineList.push(model);
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

    onAppointmentTypeChange(event: any) {
        debugger;
        this.selectedAppointmentType = event.value;
    }

    handleValueChangeList(event: any, selectedId: any) {
        let selected = this.addVaccineList.find((x) => x.id == selectedId);
        if (selected) {
            selected.date = event.value;
        }
    }


    onVaccineTypeChange(event: any, selectedId: any) {
        let selected = this.addVaccineList.find((x) => x.id == selectedId);
        if (selected) {
            selected.productId = event.value;
        }
    }

    onCheckboxChange(event: any, selectedId: any) {
        const isChecked = event.checked;

        let selected = this.addVaccineList.find((x) => x.id == selectedId);
        if (selected) {
            selected.isComplated = isChecked;
        }
    }

    handleValueChange(e) {
        debugger
        this.controlDate = this.parseDateTime(e.value)
        if (this.datetimestatus === 0) {
            if (this.controlDate.getHours() <= this.morning8.getHours() || this.controlDate <= this.morning8 || this.controlDate.getHours() >= this.evening8.getHours()) {
                this.showSweetAlert(
                    'error',
                    'Randevu saatleri uygun değil!'
                );
                this.buttonDisabled = true;
            } else {
                this.buttonDisabled = false;
            }
        }
        this.lastSelectedValue = this.parseDateTime(e.value); // Son seçilen değeri saklıyoruz

        console.log('Yeni tarih ve saat: ', this.lastSelectedValue);
        // Yeni değeri kullanmak için burada işlemler yapabilirsiniz
    }

    handleTimeValueChange(e) {

        //this.controlDate = this.parseDateTime(e.value)
        // if (this.controlDate.getHours() <= this.morning8.getHours() || this.controlDate <= this.morning8 || this.controlDate.getHours() >= this.evening8.getHours()) {
        //     this.showSweetAlert(
        //         'error',
        //         'Randevu saatleri uygun değil!'
        //     );
        //     this.buttonDisabled = true;
        // } else {
        //     this.buttonDisabled = false;
        // }
        this.timeValue = e.value;
    }


    public deletedVaccine = (id: string) => {
        const selectedvaccine = this.addVaccineList.findIndex((item) => item.id === id);
        if (selectedvaccine !== -1) {
            this.addVaccineList.splice(selectedvaccine, 1);
        }
    }

    fillFormData(selectedAppointments: AppointmentDto) {

        if (this.selectedAppointment !== null && this.selectedAppointment !== undefined) {
            if (this.selectedAppointment.appointmentType === 1) {
                this.appointmentAdd.setValue({
                    doctorId: selectedAppointments.doctorId,
                    appointmentType: selectedAppointments.appointmentType,
                    customerId: selectedAppointments.customerId,
                    note: selectedAppointments.note,
                    status: selectedAppointments.status,
                    patientId: selectedAppointments.patientsId,
                    selectedVaccineId: this.selectedVaccineId ? "00000000-0000-0000-0000-000000000000" : this.selectedVaccineId
                });
            } else {
                this.appointmentAdd.setValue({
                    doctorId: selectedAppointments.doctorId,
                    appointmentType: selectedAppointments.appointmentType,
                    customerId: selectedAppointments.customerId,
                    note: selectedAppointments.note,
                    status: selectedAppointments.status,
                    patientId: selectedAppointments.patientsId
                });
            }
            if (selectedAppointments.appointmentType == 1 && selectedAppointments.vaccineItems.length > 0) {
                this.selectedVaccineId = selectedAppointments.vaccineItems[0].productId;
                this.appointmentAdd.get('selectedVaccineId').setValue(this.selectedVaccineId);
            }
            this.selectedAppointmentType = selectedAppointments.appointmentType;
            this.selectedPatientId = selectedAppointments.patientsId;
            this.now = selectedAppointments.date;
            this.selectedStatus = selectedAppointments.status;


            if (this.selectedPatientId != null) {
                this.handleCustomerChange(this.selectedCustomerId)
            }
        }
    }

    onStatusChange(event: any) {
        this.selectedStatus = event.value;
        console.log("Seçilen değer:", this.selectedStatus);
    }

    parseDateTime(value: any): Date {
        if (value instanceof Date) {
            return value;
        }
        if (typeof value === 'string') {
            const dateTime = new Date(value);
            if (!isNaN(dateTime.getTime())) {
                return dateTime;
            }
            // Özel formatları manuel olarak parse etme
            const customFormat = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/;
            const match = (value as string).match(customFormat);
            if (match) {
                const [_, day, month, year, hours, minutes, seconds] = match.map(Number);
                return new Date(year, month - 1, day, hours, minutes, seconds);
            }
        }
        return null; // Geçersiz tarih
    }

    asyncgetParameter(): Observable<any> {
        return this._parameterService.getparameterList()
    }

    setasyncgetParameter(response: any): void {
        if (response.data) {
            this.parameters = response.data;
        }
    }

    isAppointmentControlDate(_date: Date) : Observable<any>  {
        const model = {
            date: _date
        }
        return this._appointmentService.appointmentDateCheckControl(model);
    }

    setAppointmentControlDate(response: any): void {
        if(!response.data) {
            this._isSaveControl =  response.data;
         }
    }

}

const StatusTypeValues = {
    1: "Bekliyor",
    2: "IptalEdildi",
    3: "Gorusuldu",
    4: "Gelmedi"
};

