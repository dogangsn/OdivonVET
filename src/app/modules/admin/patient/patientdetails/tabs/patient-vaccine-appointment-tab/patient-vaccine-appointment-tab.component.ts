import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslocoService } from '@ngneat/transloco';
import { GeneralService } from 'app/core/services/general/general.service';
import { CustomerDataService } from 'app/modules/admin/customer/customerdetails/services/customer-data.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { CreateVaccineListDto } from '../../../createvaccine/models/vaccine-examination-list-dto';
import { VaccineCalendarService } from 'app/core/services/vaccinecalendar/vaccinecalendar.service';
import { VaccineAppointmentDoneComponent } from './dialogs/vaccine-appointment-done/vaccine-appointment-done.component';

@Component({
  selector: 'app-patient-vaccine-appointment-tab',
  templateUrl: './patient-vaccine-appointment-tab.component.html',
  styleUrls: ['./patient-vaccine-appointment-tab.component.css']
})
export class PatientVaccineAppointmentTabComponent implements OnInit {

  displayedColumns: string[] = ['vaccineName', 'vaccineDate', 'isDone',  'actions'];
  recievedPatientId:string;
  isUpdateButtonActive: boolean;
  @ViewChild('paginator') paginator: MatPaginator;
  vaccineAppointmentList: CreateVaccineListDto[] = [];
  dataSource = new MatTableDataSource<CreateVaccineListDto>(this.vaccineAppointmentList);
  vaccineAppointment: CreateVaccineListDto;

  constructor(
    private _dialog: MatDialog,
    private _translocoService: TranslocoService,
    private _customerDataService: CustomerDataService,
    private _vaccineCalendarService: VaccineCalendarService
  ) { }

  ngOnInit() {
    this.recievedPatientId=this._customerDataService.getPatientId();
    this.getPatientVaccineList();
  }

  getPatientVaccineList() {

    const model = {
      PatientId: this.recievedPatientId
    }

    this._vaccineCalendarService.getPatientVaccineList(model).subscribe((response) => {
      this.vaccineAppointmentList = response.data;
      this.dataSource = new MatTableDataSource<CreateVaccineListDto>(
        this.vaccineAppointmentList
      );
      this.dataSource.paginator = this.paginator;
    });
  }


  showSweetAlert(type: string, message: string): void {
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
        this.translate(message),
        SweetalertType.error
      );
      GeneralService.sweetAlert(sweetAlertDto);
    }
  }

  translate(key: string): any {
    return this._translocoService.translate(key);
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
          this._vaccineCalendarService
            .deletePatientVaccine(model)
            .subscribe((response) => {
              if (response.isSuccessful) {
                this.getPatientVaccineList();
                const sweetAlertDto2 = new SweetAlertDto(
                  this.translate('sweetalert.success'),
                  this.translate('sweetalert.transactionSuccessful'),
                  SweetalertType.success
                );
                GeneralService.sweetAlert(sweetAlertDto2);
              } else {
                this.showSweetAlert('error', response.errors[0]);
                console.log(response.errors[0]);
              }
            });
        }
      }
    );
  };

  public redirectToDone(vaccineAppointment){
    const dialog = this._dialog
        .open(VaccineAppointmentDoneComponent, {
            maxWidth: '100vw !important',
            disableClose: true,
            data: vaccineAppointment,
        })
        .afterClosed()
        .subscribe((response) => {
            if (response.status) {
                this.getPatientVaccineList();
            }
        });
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
}
