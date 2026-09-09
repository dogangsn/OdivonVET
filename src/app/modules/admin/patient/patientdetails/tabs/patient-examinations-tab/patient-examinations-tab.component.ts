import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ExaminationService } from 'app/core/services/examination/exammination.service';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { TranslocoService } from '@ngneat/transloco';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { ExaminationListDto } from '../../../examination/model/ExaminationListDto';
import { ExaminationDto } from '../../../examination/model/ExaminationDto';
import { ExaminationAddDialogComponent } from '../../../examination/examination-add-dialog/examination-add-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { CustomerDataService } from 'app/modules/admin/customer/customerdetails/services/customer-data.service';
@Component({
  selector: 'app-patient-examinations-tab',
  templateUrl: './patient-examinations-tab.component.html',
  styleUrls: ['./patient-examinations-tab.component.css']
})
export class PatientExaminationsTabComponent implements OnInit {
  examinationList: ExaminationListDto[] = [];
  dataSource = new MatTableDataSource<ExaminationListDto>(
      this.examinationList
  );
  loader = true;
  receivedPatientId: string;

  displayedColumns: string[] = [
      'status',
      'date',
    //   'customerName',
    //   'patientName',
      'weight',
      'complaintStory',
      'treatmentDescription',
      'symptoms',
      'actions',
  ];

  @ViewChild('paginator') paginator: MatPaginator;
  isUpdateButtonActive: boolean = false;

  constructor(
      private _examinationService: ExaminationService,
      private _dialog: MatDialog,
      private _translocoService: TranslocoService,
      private _customerDataService: CustomerDataService,
  ) {}

  ngOnInit() {
    this.receivedPatientId = this._customerDataService.getPatientId();
    this.getExaminationList();
  }

  getExaminationList() {
      const model = {
        id : this.receivedPatientId,
      }
      this._examinationService.getExaminationlistByPatientId(model).subscribe((response) => {
          this.examinationList = response.data;
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

  addPanelOpen(): void {
      const dialog = this._dialog
          .open(ExaminationAddDialogComponent, {
              maxWidth: '100vw !important',
              data: null,
          })
          .afterClosed()
          .subscribe((response) => {
              if (response.status) {
                  this.getExaminationList();
              }
          });
  }

  translate(key: string): any {
      return this._translocoService.translate(key);
  }

  public redirectToUpdate = (id: string) => {
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
