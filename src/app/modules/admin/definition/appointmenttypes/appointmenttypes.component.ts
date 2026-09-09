import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { AppointmentTypesDto } from './models/appointmentTypesDto';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { AppointmentTypeservice } from 'app/core/services/definition/appointmenttypes/appointmenttypes.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { CreateEditAppointmenttypesComponent } from './dialogs/create-edit-appointmenttypes.component';
import { LogViewComponent } from '../../commonscreen/log-view/log-view.component';

@Component({
  selector: 'app-appointmenttypes',
  templateUrl: './appointmenttypes.component.html',
  styleUrls: ['./appointmenttypes.component.css']
})
export class AppointmenttypesComponent implements OnInit {

  displayedColumns: string[] = ['colors', 'remark', 'actions'];

  isUpdateButtonActive: boolean;
  @ViewChild('paginator') paginator: MatPaginator;
  appointmentTypes: AppointmentTypesDto[] = [];
  dataSource = new MatTableDataSource<AppointmentTypesDto>(this.appointmentTypes);

  constructor(
    private _dialog: MatDialog,
    private _translocoService: TranslocoService,
    private _appointmenttypesService: AppointmentTypeservice
  ) { }

  ngOnInit() {
    this.getAppointmentTypeList();
  }


  getAppointmentTypeList(): void {
    this._appointmenttypesService.getAppointmentTypes().subscribe((response) => {
      this.appointmentTypes = response.data;
      this.dataSource = new MatTableDataSource<AppointmentTypesDto>(
        this.appointmentTypes
      );
      this.dataSource.paginator = this.paginator;
    });
  }

  addPanelOpen(): void {
    this.isUpdateButtonActive = false;
    const dialog = this._dialog
      .open(CreateEditAppointmenttypesComponent, {
        maxWidth: '100vw !important',
        disableClose: true,
        data: null,
      })
      .afterClosed()
      .subscribe((response) => {
        if (response.status) {
          this.getAppointmentTypeList();
        }
      });
  }

  public redirectToUpdate = (id: string) => {
    this.isUpdateButtonActive = true;
    const selectedAppointment = this.appointmentTypes.find((x) => x.id === id);
    if (selectedAppointment) {
      const dialogRef = this._dialog.open(
        CreateEditAppointmenttypesComponent,
        {
          maxWidth: '100vw !important',
          disableClose: true,
          data: selectedAppointment
        }
      );
      dialogRef.afterClosed().subscribe((response) => {
        if (response.status) {
          this.getAppointmentTypeList();
        }
      });
    }
  };

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
          this._appointmenttypesService
            .deleteAppointmentTypes(model)
            .subscribe((response) => {
              if (response.isSuccessful) {
                this.getAppointmentTypeList();
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

}
