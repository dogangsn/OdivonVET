import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { PatientDetailsDto } from '../../../models/PatientDetailsDto';
import { MatTableDataSource } from '@angular/material/table';
import { ExaminationService } from 'app/core/services/examination/exammination.service';
import { ExaminationListDto } from '../../../../patient/examination/model/ExaminationListDto';
import { CustomerDataService } from '../../services/customer-data.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { TranslocoService } from '@ngneat/transloco';
import { ExaminationAddDialogComponent } from 'app/modules/admin/patient/examination/examination-add-dialog/examination-add-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LogViewComponent } from 'app/modules/admin/commonscreen/log-view/log-view.component';
import { ExaminationCollectionComponent } from '../../dialogs/collection/examination-collection/examination-collection.component';

@Component({
  selector: 'app-examination-tab',
  templateUrl: './examination-tab.component.html',
  styleUrls: ['./examination-tab.component.css']
})
export class ExaminationTabComponent implements OnInit {

  displayedColumns: string[] = [
    'status',
    'date',
    'patientName',
    'weight',
    'complaintStory',
    'treatmentDescription',
    'symptoms',
    'actions'
  ];

  @ViewChild('paginator') paginator: MatPaginator;
  receivedCustomerId: string;
  loader = true;
  isUpdateButtonActive: boolean = false;
  action: any;
  examinationTabAction: any;

  examinationList: ExaminationListDto[] = [];
  dataSource = new MatTableDataSource<ExaminationListDto>(
    this.examinationList
  );

  constructor(
    private _examinationService: ExaminationService,
    private _customerDataService: CustomerDataService,
    private _translocoService: TranslocoService,
    private _dialog: MatDialog,
    private router: Router,
  ) {
    const actions = localStorage.getItem('actions');
    if (actions) {
      this.action = JSON.parse(actions);
    }

    const examinationAct = this.action.find((item: any) => {
      return item.roleSettingDetails.some((detail: any) => detail.target === 'customer');
    });

    if (examinationAct) {
      this.examinationTabAction = examinationAct.roleSettingDetails.find((detail: any) => detail.target === 'customer');
    } else {
      this.examinationTabAction = null;
    }
  }

  ngOnInit() {
    this.receivedCustomerId = this._customerDataService.getCustomerId();

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.getExaminationList();
  }


  getExaminationList() {
    const model = {
      customerId: this.receivedCustomerId
    }
    this._examinationService.getExaminationlist(model).subscribe((response) => {
      this.examinationList = response.data;
      debugger
      this.dataSource = new MatTableDataSource<ExaminationListDto>(
        this.examinationList
      );
      setTimeout(() => {
        if (this.dataSource) {
          this.dataSource.paginator = this.paginator;
        }
      }, 0);
      this.loader = false;
    });
  }

  public redirectToUpdatePatientTab = (id: string) => {
    this.isUpdateButtonActive = true;

    const selectedExamination = this.examinationList.find(
      (x) => x.id === id
    );
    var model = {
      id: selectedExamination.id,
    };
    if (selectedExamination) {
      const dialogRef = this._dialog.open(ExaminationAddDialogComponent, {
        maxWidth: '100vw !important',
        disableClose: true,
        data: selectedExamination.id,
      });
      dialogRef.afterClosed().subscribe((response) => {
        if (response.status) {
          this.getExaminationList();
        }
      });
    }
  };


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

  public redirectToUpdateStatus = (id: string, status: string) => {
    const sweetAlertDto = new SweetAlertDto(
      this.translate('sweetalert.areYouSure'),
      this.translate('sweetalert.areYouSureChange'),
      SweetalertType.warning
    );
    GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
      (swalResponse) => {
        if (swalResponse.isConfirmed) {
          const selectedExamination = this.examinationList.find(
            (x) => x.id === id
          );
          var model = {
            id: selectedExamination.id,
            status: status
          };
          this._examinationService
            .updateExaminationStatus(model)
            .subscribe((response) => {
              if (response.isSuccessful) {
                this.getExaminationList();
                const sweetAlertDto2 = new SweetAlertDto(
                  this.translate('sweetalert.success'),
                  this.translate(
                    'sweetalert.transactionSuccessful'
                  ),
                  SweetalertType.success
                );
                GeneralService.sweetAlert(sweetAlertDto2);
              } else {
                this.showSweetAlert(
                  'error',
                  response.errors[0]
                );
                console.log(response.errors[0]);
              }
            });
        }
      }
    );
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
          const selectedExamination = this.examinationList.find(
            (x) => x.id === id
          );
          var model = {
            id: selectedExamination.id,
          };
          this._examinationService
            .deleteExamination(model)
            .subscribe((response) => {
              if (response.isSuccessful) {
                this.getExaminationList();
                const sweetAlertDto2 = new SweetAlertDto(
                  this.translate('sweetalert.success'),
                  this.translate(
                    'sweetalert.transactionSuccessful'
                  ),
                  SweetalertType.success
                );
                GeneralService.sweetAlert(sweetAlertDto2);
              } else {
                this.showSweetAlert(
                  'error',
                  response.errors[0]
                );
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

  public redirectToPatientDetails = (id: string) => {

    const selectedExamination = this.examinationList.find(
      (x) => x.id === id
    );
    if (selectedExamination) {
      this.router.navigate(['/patientslist/patientdetails/', selectedExamination.patientId]);

    }
  };

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

  public examinationCollectionDetails = (id: string) => {
    const dialogRef = this._dialog.open(
      ExaminationCollectionComponent,
      {
        maxWidth: '100vw !important',
        disableClose: true,
        data: { examinationId: id },
      }
    );
  }


}
