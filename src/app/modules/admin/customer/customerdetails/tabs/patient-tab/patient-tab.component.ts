import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { PatientDetailsDto } from '../../../models/PatientDetailsDto';
import { CustomerDataService } from '../../services/customer-data.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { TranslocoService } from '@ngneat/transloco';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentHistoryComponent } from '../../dialogs/appointment-history/appointment-history.component';

@Component({
  selector: 'app-patient-tab',
  templateUrl: './patient-tab.component.html',
  styleUrls: ['./patient-tab.component.css'],
})

export class PatientTabComponent implements OnInit {

  displayedColumns: string[] = ['name', 'birthDate', 'chipNumber', 'animalTypeName', 'actions'];

  @ViewChild('paginator') paginator: MatPaginator;
  receivedCustomerId: string;
  patientList: PatientDetailsDto[] = [];
  dataSource = new MatTableDataSource<PatientDetailsDto>(this.patientList);
  loader = true;
  action:any;
  patientTabAction:any

  constructor(
    private _customerDataService: CustomerDataService,
    private _customerService: CustomerService,
    private _translocoService: TranslocoService,
    private router: Router,
    private _dialog: MatDialog,
  ) { 
    const actions = localStorage.getItem('actions');
        if (actions) {
            this.action = JSON.parse(actions);
        }
    
        const patientAct = this.action.find((item: any) => {
            return item.roleSettingDetails.some((detail: any) => detail.target === 'customer');
        });
    
        if (patientAct) {
            this.patientTabAction = patientAct.roleSettingDetails.find((detail: any) => detail.target === 'customer');
        } else {
            this.patientTabAction = null;
        }
  }

  ngOnInit() {
    this.receivedCustomerId = this._customerDataService.getCustomerId();
    this.getPatients();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getPatients(): void {
    const patientModel = {
      id: this.receivedCustomerId,
    };

    this._customerService.getPatientsByCustomerId(patientModel).subscribe({
      next: (response) => {
        this.patientList = response.data;
        this.dataSource.data = this.patientList;
        setTimeout(() => {
          if (this.dataSource) {
            this.dataSource.paginator = this.paginator;
          }
        }, 0);
        this.loader = false;
      },
      error: (err) => {
        console.error(err);
        this.showSweetAlert('error', 'Failed to load patient data.');
        this.loader = false;
      }
    });
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

  formatDate(date: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    return new Date(date).toLocaleString('tr-TR', options);
  }

  public redirectToUpdate = (id: string) => {
    console.log(id);
    this.router.navigate(['/patientslist/patientdetails/', id]);
  };

  public redirectToDeletePatient = (id: string) => {
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
          this._customerService
            .deletePatients(model)
            .subscribe((response) => {
              if (response.isSuccessful) {
                this.getPatients();
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

  public openAppointmentHistory = (id : string) => {

      const model = {
          customerId: this.receivedCustomerId,
          isPatientDetail: true,
          selectedPatientId : id,
          visibleCustomer: false,
      }
      console.log(model);
      const dialog = this._dialog
          .open(AppointmentHistoryComponent, {
              maxWidth: '100vw !important',
              disableClose: true,
              data: model
          })
          .afterClosed()
          .subscribe((response) => {
              if (response.status) {
              
              }
          });
  
  }

}
