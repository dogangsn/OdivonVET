import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslocoService } from '@ngneat/transloco';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { AppointmentTypeDto } from 'app/modules/admin/appointment/appointmentcalendar/models/appointmentTypeDto';
import { AppointmentDto } from 'app/modules/admin/appointment/appointmentcalendar/models/appointmentDto';
import { ProductDescriptionService } from 'app/core/services/definition/productdescription/productdescription.service';
import { ProductDescriptionsDto } from 'app/modules/admin/definition/productdescription/models/ProductDescriptionsDto';
import { UpdateAppointmentCommand } from '../models/UpdateAppointmentCommand';
import { AppointmentService } from 'app/core/services/appointment/appointment.service';

@Component({
    selector: 'app-edit-appointment.component',
    templateUrl: './edit-appointment.component.html',
    styleUrls: ['./edit-appointment.component.css'],
})
export class EditAppointmentComponent implements OnInit {
    appointmentEdit: FormGroup;
    appointmentsList: AppointmentTypeDto[] = [];
    selectedCustomerId: any;
    selectedAppointment: AppointmentDto;
    selectedAppointmentType: number;
    productdescription: ProductDescriptionsDto[] = [];
    
    lastSelectedValue: Date = new Date();
    now: Date = new Date();
    visibleVaccine: boolean;

    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _translocoService: TranslocoService,
        private _productdescriptionService: ProductDescriptionService,
        private _appointmentService: AppointmentService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        console.log(data);
        this.selectedAppointment = data.selectedAppointment;
        this.selectedCustomerId = data.customerId;
    }

    ngOnInit(): void {
        this.getProductList();

        this.appointmentsList = appointments;

        this.appointmentEdit = this._formBuilder.group({
            appointmentType: [2, Validators.required],
            note : [''],
            vaccineId : ['']
        });

        this.fillFormData(this.selectedAppointment);

        if(this.selectedAppointment.vaccineId == '00000000-0000-0000-0000-000000000000'){
            this.visibleVaccine = false;
        }else{
            this.visibleVaccine = true;
        }

    }

    fillFormData(selected: AppointmentDto) {
        if (this.selectedAppointment !== null) {
            this.appointmentEdit.setValue({
                appointmentType: selected.appointmentType,
                note: selected.note,
                vaccineId: selected.vaccineId
            });
        }
    }

    showSweetAlert(type: string, message: string): void {
        if (type === 'success') {
            const sweetAlertDto = new SweetAlertDto(
                this.translate(message),
                this.translate('sweetalert.transactionSuccessful'),
                SweetalertType.success
            );
            GeneralService.sweetAlert(sweetAlertDto);
        } else {
            const sweetAlertDto = new SweetAlertDto(
                this.translate(message),
                this.translate('sweetalert.transactionFailed'),
                SweetalertType.error
            );
            GeneralService.sweetAlert(sweetAlertDto);
        }
    }

    translate(key: string): any {
        return this._translocoService.translate(key);
    }

    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }

    onAppointmentTypeChange(event: any) {
        this.selectedAppointmentType = event.value;
    }

    handleValueChangeList(event: any) {
        this.lastSelectedValue = event.value;
    }

    getProductList() {
        const model = {
            ProductType: 2,
        };
        this._productdescriptionService
            .getProductDescriptionFilters(model)
            .subscribe((response) => {
                this.productdescription = response.data;
                console.log(this.productdescription);
            });
    }

    UpdateAppointment(): void {
        debugger;

        const sweetAlertDto = new SweetAlertDto(
            this.translate('sweetalert.areYouSure'),
            this.translate('sweetalert.apponitnmentAreSure'),
            SweetalertType.warning
        );
        GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
            (swalResponse) => {
                if (swalResponse.isConfirmed) {
                    const item = new UpdateAppointmentCommand(
                        this.selectedAppointment.id,
                        this.lastSelectedValue,
                        this.selectedCustomerId,
                        this.getFormValueByName('note'),
                        this.getFormValueByName('appointmentType'),
                        this.selectedAppointment.vaccineId 
                    );

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
            }
        );
    }

    getFormValueByName(formName: string): any {
        return this.appointmentEdit.get(formName).value;
    }

}

const appointments: AppointmentTypeDto[] = [
    {
        id: 1,
        remark: 'Aşı Randevusu',
    },
    {
        id: 2,
        remark: 'Genel Muayene',
    },
    {
        id: 3,
        remark: 'Kontrol Muayene',
    },
    {
        id: 4,
        remark: 'Operasyon',
    },
    {
        id: 5,
        remark: 'Tıraş',
    },
    {
        id: 6,
        remark: 'Tedavi',
    },
];
