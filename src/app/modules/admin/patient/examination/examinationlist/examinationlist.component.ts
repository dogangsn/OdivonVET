
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ExaminationService } from 'app/core/services/examination/exammination.service';
import { ExaminationaddComponent } from '../examinationadd/examinationadd.component';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ExaminationAddDialogComponent } from '../examination-add-dialog/examination-add-dialog.component';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { TranslocoService } from '@ngneat/transloco';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { ExaminationListDto } from '../model/ExaminationListDto';
import { ExaminationDto } from '../model/ExaminationDto';
import { LogViewComponent } from 'app/modules/admin/commonscreen/log-view/log-view.component';


@Component({
    selector: 'app-examinationlist',
    templateUrl: './examinationlist.component.html',
    styleUrls: ['./examinationlist.component.css'],
})
export class ExaminationlistComponent implements OnInit {
    examinationList: ExaminationListDto[] = [];
    dataSource = new MatTableDataSource<ExaminationListDto>(
        this.examinationList
    );
    loader = true;
    examination: ExaminationDto;
    items = Array(13);

    displayedColumns: string[] = [
        'status',
        'date',
        'customerName',
        'patientName',
        'weight',
        'complaintStory',
        'treatmentDescription',
        'symptoms',
        'actions',
    ];
    action:any;
    examinationListAct:any;

    @ViewChild('paginator') paginator: MatPaginator;
    isUpdateButtonActive: boolean = false;

    constructor(
        private _examinationService: ExaminationService,
        private _dialog: MatDialog,
        private _translocoService: TranslocoService
    ) {
        const actions = localStorage.getItem('actions');
        if (actions) {
            this.action = JSON.parse(actions);
        }

        const examinationact = this.action.find((item: any) => {
            return item.roleSettingDetails.some((detail: any) => detail.target === 'examination');
        });
    
        if (examinationact) {
            this.examinationListAct = examinationact.roleSettingDetails.find((detail: any) => detail.target === 'examination');
        } else {
            this.examinationListAct = null;
        }
    }

    ngOnInit() {
        this.getExaminationList();
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    getExaminationList() {
        const model = {
            customerId : '00000000-0000-0000-0000-000000000000'
        }
        this._examinationService.getExaminationlist(model).subscribe((response) => {
            this.examinationList = response.data;
            debugger
            this.dataSource = new MatTableDataSource<ExaminationListDto>(
                this.examinationList
            );
            this.dataSource.paginator = this.paginator;
            setTimeout(() => {
                if (this.dataSource) {
                    this.dataSource.paginator = this.paginator;
                }
            }, 0);
            this.loader = false;
        });
    }

    addPanelOpen(): void {
        // const dialog = this._dialog
        //     .open(ExaminationAddDialogComponent, {
        //         maxWidth: '100vw !important',
        //         data: null,
        //     })
        //     .afterClosed()
        //     .subscribe((response) => {
        //         if (response.status) {
        //             this.getExaminationList();
        //         }
        //     });
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

      applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
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
