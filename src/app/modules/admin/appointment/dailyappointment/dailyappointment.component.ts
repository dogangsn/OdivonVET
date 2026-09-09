import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { DailyAppointmentListDto } from './models/dailyappointmentlistdto';
import { MatTableDataSource } from '@angular/material/table';
import { AppointmentService } from 'app/core/services/appointment/appointment.service';
import { TranslocoService } from '@ngneat/transloco';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LogViewComponent } from '../../commonscreen/log-view/log-view.component';
import { AddApponitnmentDialogComponent } from '../appointmentcalendar/add-apponitnment-dialog/add-apponitnment-dialog.component';
import { EditAppointmentComponent } from '../../customer/customerdetails/dialogs/appointment-history/dialogs/edit-appointment.component';
import { MessageSendComponent } from '../../commonscreen/message-send/message-send.component';
import { SmsType } from '../../definition/smstemplate/models/smsType.enum';

@Component({
  selector: 'app-dailyappointment',
  templateUrl: './dailyappointment.component.html',
  styleUrls: ['./dailyappointment.component.css']
})
export class DailyappointmentComponent implements OnInit {

  displayedColumns: string[] = ['date', 'customerPatientName', 'services', 'statusName', 'actions'];

  isUpdateButtonActive: boolean;
  @ViewChild('paginator') paginator: MatPaginator;

  dailyappointment: DailyAppointmentListDto[] = [];
  dataSource = new MatTableDataSource<DailyAppointmentListDto>(this.dailyappointment);
  loader = true;
  action: any;
  dailyAppointment:any

  constructor(
    private _appointmentService: AppointmentService,
    private _translocoService: TranslocoService,
    private _dialog: MatDialog,
  ) {
    const actions = localStorage.getItem('actions');
        if (actions) {
            this.action = JSON.parse(actions);
        }

        const appointment = this.action.find((item: any) => {
            return item.roleSettingDetails.some((detail: any) => detail.target === 'dailyappointment');
        });
    
        if (appointment) {
            this.dailyAppointment = appointment.roleSettingDetails.find((detail: any) => detail.target === 'dailyappointment');
        } else {
            this.dailyAppointment = null;
        }
   }

  ngOnInit() {
    this.getAppointmentDailyList();
  }

  getAppointmentDailyList() {

    this._appointmentService
      .getAppointmentDailyList()
      .subscribe((response) => {
        this.dailyappointment = response.data;
        this.dataSource = new MatTableDataSource<DailyAppointmentListDto>(
          this.dailyappointment
        );
        this.dataSource.paginator = this.paginator;
        setTimeout(() => {
          if (this.dataSource) {
            this.dataSource.paginator = this.paginator;
          }
        }, 0)
        this.loader = false;
      });
  }

  translate(key: string): any {
    return this._translocoService.translate(key);
  }

  public redirectToUpdate = (id: string) => {
    const selectedAppointment = this.dailyappointment.find((item) => item.id == id);
    if (selectedAppointment) {
      const model = {
        visibleCustomer: true,
        selectedAppointment: selectedAppointment,
        customerId: selectedAppointment.customerId
      };
      const dialogRef = this._dialog.open(
        AddApponitnmentDialogComponent,
        {
          minWidth: '1000px',
          disableClose: true,
          data: model
        }
      );
      dialogRef.afterClosed().subscribe((response) => {
        if (response.status) {
          this.getAppointmentDailyList();
        }
      });
    }

    // // const selectedAppointment = this.dailyappointment.find((item) => item.id == id);
    // // if (selectedAppointment) {

    // //     const model = {
    // //         visibleCustomer: false,
    // //         selectedAppointment: selectedAppointment,
    // //         customerId:  selectedAppointment.customerId
    // //     };

    // //     const dialogRef = this._dialog.open(
    // //         EditAppointmentComponent,
    // //         {
    // //             maxWidth: '100vw !important',
    // //             disableClose: true,
    // //             data: model
    // //         }
    // //     );
    // //     dialogRef.afterClosed().subscribe((response) => {
    // //         if (response.status) {
    // //             this.getAppointmentDailyList();
    // //         }
    // //     });
    // // }


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
                this.getAppointmentDailyList();
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

  public redirectStatusUpdate = (id: string, status: number) => {
    const model = {
      id: id,
      status: status
    };
    this._appointmentService
      .updateAppointmentStatus(model)
      .subscribe((response) => {
        if (response.isSuccessful) {
          this.getAppointmentDailyList();
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

  public logView = (id: string) => {
    const dialogRef = this._dialog.open(
      LogViewComponent,
      {
        maxWidth: '100vw !important',
        disableClose: true,
        data: { masterId: id },
      }
    );

  }

  public sendMessage = (id: string) => {

    let messageTemplate = `
Merhaba {0},

Bu bir randevu hatırlatma mesajıdır.
Randevu Tarihi: {1}
Randevunuzu kaçırmamanız için lütfen bu mesajı dikkate alınız. Herhangi bir sebepten dolayı randevunuza gelemeyecekseniz, lütfen bizi en kısa sürede bilgilendirin.

Teşekkürler,
`;

    function formatMessage(messageTemplate, ...values) {
      return messageTemplate.replace(/{(\d+)}/g, (match, number) => {
        return typeof values[number] !== 'undefined' ? values[number] : match;
      });
    }

    const selectedAppointment = this.dailyappointment.find((item) => item.id == id);
    if (selectedAppointment) {

      let customerName =  selectedAppointment.customerPatientName;
      let appointmentDate = this.formatDate(selectedAppointment.date.toString());
      let _message = formatMessage(messageTemplate, customerName, appointmentDate);
      
      const model = {
        messageType: SmsType.AppointmentReminder,
        isFixMessage: true,
        customerId : selectedAppointment.customerId,
        customername: customerName,
        date : appointmentDate
      };
      const dialog = this._dialog
        .open(MessageSendComponent, {
          minWidth: '1000px',
          disableClose: true,
          data: model,
        })
        .afterClosed()
        .subscribe((response) => {
          if (response.status) {
            // this.getApponitmentList();
          }
        });
    }


  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
}

}
