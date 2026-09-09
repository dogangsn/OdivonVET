import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { TranslocoService } from '@ngneat/transloco';
import { AppointmentService } from 'app/core/services/appointment/appointment.service';
import { GeneralService } from 'app/core/services/general/general.service';
import { AppointmentDto } from 'app/modules/admin/appointment/appointmentcalendar/models/appointmentDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { MatTableDataSource } from '@angular/material/table';
import { AddApponitnmentDialogComponent } from 'app/modules/admin/appointment/appointmentcalendar/add-apponitnment-dialog/add-apponitnment-dialog.component';
import { EditAppointmentComponent } from './dialogs/edit-appointment.component';

@Component({
    selector: 'app-appointment-history',
    templateUrl: './appointment-history.component.html',
    styleUrls: ['./appointment-history.component.css'],
})
export class AppointmentHistoryComponent implements OnInit {

    displayedColumns: string[] = [
        'complated',
        'beginDate',
        'text',
        'actions',
    ];
    @ViewChild('paginator') paginator: MatPaginator;

    selectedCustomerId: any;
    appointmentList: AppointmentDto[] = [];
    dataSource = new MatTableDataSource<AppointmentDto>(this.appointmentList);
    isPatientDetail : boolean = false;
    selectedPatientId : any;

    constructor(
        private _formBuilder: FormBuilder,
        private _dialogRef: MatDialogRef<any>,
        private _translocoService: TranslocoService,
        private _appointmentService: AppointmentService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _dialog: MatDialog,
    ) {
        this.selectedCustomerId = data.customerId;
        this.selectedPatientId = data.selectedPatientId;
        this.isPatientDetail = data.isPatientDetail;
    }

    ngOnInit() {
        this.getAppointmentsByIdList();
    }

    getAppointmentsByIdList() {

        const model = {
            CustomerId: this.selectedCustomerId,
            PatientId: this.selectedCustomerId.isPatientDetail ? '00000000-0000-0000-0000-000000000000' : this.selectedPatientId
        }
        this._appointmentService.getAppointmentsByIdList(model).subscribe((response) => {
            this.appointmentList = response.data;
            this.dataSource = new MatTableDataSource<AppointmentDto>(
                this.appointmentList
            );
            this.dataSource.paginator = this.paginator;
        });
    }

    closeDialog(): void {
        this._dialogRef.close({ status: null });
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

    public redirectToUpdate = (id: string) => {
        const selectedAppointment = this.appointmentList.find((item) => item.id == id);
        if (selectedAppointment) {

            const model = {
                visibleCustomer: false,
                selectedAppointment: selectedAppointment,
                customerId: this.selectedCustomerId
            };

            const dialogRef = this._dialog.open(
                EditAppointmentComponent,
                {
                    maxWidth: '100vw !important',
                    disableClose: true,
                    data: model
                }
            );
            dialogRef.afterClosed().subscribe((response) => {
                if (response.status) {
                    this.getAppointmentsByIdList();
                }
            });
        }
    }

    public redirectToDelete = (id: string) => {
        const sweetAlertDto = new SweetAlertDto(
            this.translate('sweetalert.areYouSure'),
            this.translate('sweetalert.areYouSureDelete'),
            SweetalertType.warning
        );
        GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
            (swalResponse) => {
                if (swalResponse.isConfirmed) {
                    const model = {
                        id: id,
                    };
                    this._appointmentService
                        .deleteAppointment(model)
                        .subscribe((response) => {
                            if (response.isSuccessful) {
                                this.getAppointmentsByIdList();
                                const sweetAlertDto2 = new SweetAlertDto(
                                    this.translate('sweetalert.success'),
                                    this.translate('sweetalert.transactionSuccessful'),
                                    SweetalertType.success
                                );
                                GeneralService.sweetAlert(sweetAlertDto2);
                            } else {
                                console.error('Silme işlemi başarısız.');
                            }
                        });
                }
            }
        );
    }

    formatDate(date: string): string {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        };
        return new Date(date).toLocaleString('tr-TR', options);
    }

    toggleCompleted(item: AppointmentDto): void {

        if (this.IsDateControl(item)) {
            this.showSweetAlert('error', 'Geçmiş Randevu Üzerinde işlem yapılamaz.');
            return;
        }

        if (item.isComplated) {
            item.isComplated = false;
        } else {
            item.isComplated = true;
        }

        const model = {
            id: item.id,
            isCompleted: item.isComplated
        }
        this._appointmentService.updateCompletedAppointment(model).subscribe((response) => {
            if (response.isSuccessful) {
                item.isComplated = !item.isComplated;
                this.getAppointmentsByIdList();
                this.showSweetAlert('success', '');
            } else {
                this.showSweetAlert('error', response.errors[0]);
            }

        });
        console.log(item);
    }

    shouldMarkExpired(element: AppointmentDto): boolean {
        if (element.isComplated) {
            return false;
        }
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() - 1);

        const rowDate = new Date(element.beginDate);
        return rowDate < tomorrow;
    }

    IsDateControl(element: AppointmentDto): boolean {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() - 1);
        const rowDate = new Date(element.beginDate);
        return rowDate < tomorrow;
    }



}
