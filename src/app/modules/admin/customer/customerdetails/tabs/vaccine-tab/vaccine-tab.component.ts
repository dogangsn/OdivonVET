import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { VaccineListDto } from 'app/modules/admin/definition/vaccinelist/models/vaccineListDto';
import { CustomerDataService } from '../../services/customer-data.service'; 
import { CreateVaccineListDto } from 'app/modules/admin/patient/createvaccine/models/vaccine-examination-list-dto';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { VaccineCalendarService } from 'app/core/services/vaccinecalendar/vaccinecalendar.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { VaccineAppointmentDoneComponent } from 'app/modules/admin/patient/patientdetails/tabs/patient-vaccine-appointment-tab/dialogs/vaccine-appointment-done/vaccine-appointment-done.component';


@Component({
  selector: 'app-vaccine-tab',
  templateUrl: './vaccine-tab.component.html',
  styleUrls: ['./vaccine-tab.component.css']
})
export class VaccineTabComponent implements OnInit {


  displayedColumns: string[] = ['vaccineName', 'vaccineDate', 'isDone',  'actions'];
  recievedCustpmerId:string;
  isUpdateButtonActive: boolean;
  @ViewChild('paginator') paginator: MatPaginator;
  vaccineAppointmentList: CreateVaccineListDto[] = [];
  dataSource = new MatTableDataSource<CreateVaccineListDto>(this.vaccineAppointmentList);
  vaccineAppointment: CreateVaccineListDto;
  action:any;
  vaccineAction:any;

  constructor(
    private _dialog: MatDialog,
    private _translocoService: TranslocoService,
    private _customerDataService: CustomerDataService,
    private _vaccineCalendarService: VaccineCalendarService
  ) { 
    const actions = localStorage.getItem('actions');
    if (actions) {
        this.action = JSON.parse(actions);
    }

    const customer = this.action.find((item: any) => {
        return item.roleSettingDetails.some((detail: any) => detail.target === 'customer');
    });

    if (customer) {
        this.vaccineAction = customer.roleSettingDetails.find((detail: any) => detail.target === 'customer');
    } else {
        this.vaccineAction = null;
    }
  }

  ngOnInit() {
    this.recievedCustpmerId=this._customerDataService.getCustomerId();
    this.getPatientVaccineList();
  }

  getPatientVaccineList() {

    const model = {
      CustomerId: this.recievedCustpmerId
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
