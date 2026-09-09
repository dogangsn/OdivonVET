import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslocoService } from '@ngneat/transloco';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';

import { PatientListService } from 'app/core/services/patient/patientList/patientList.service';
import { PatientOwnerListDto } from './models/patientOwnerListDto';
import { Router } from '@angular/router';
import { CreateEditPatientComponent } from './create-edit-patient/create-edit-patient.component';

@Component({
    selector: 'app-patientlist',
    templateUrl: './patientlist.component.html',
    styleUrls: ['./patientlist.component.css']
})
export class PatientlistComponent implements OnInit {

    displayedColumns: string[] = ['name', 'animalTypeName', 'customerFirsLastName', 'actions'];

    isUpdateButtonActive: boolean;
    @ViewChild('paginator') paginator: MatPaginator;


    patientList: PatientOwnerListDto[] = [];
    dataSource = new MatTableDataSource<PatientOwnerListDto>(this.patientList);
    loader: boolean = true;
    items = Array(13);
    action:any;
    patientlistAction:any;

    constructor(
        private _dialog: MatDialog,
        private _translocoService: TranslocoService,
        private _patientService: PatientListService,
        private router: Router,
    ) { 
        const actions = localStorage.getItem('actions');
        if (actions) {
            this.action = JSON.parse(actions);
        }
    
        const patient = this.action.find((item: any) => {
            return item.roleSettingDetails.some((detail: any) => detail.target === 'patientslist');
        });
    
        if (patient) {
            this.patientlistAction = patient.roleSettingDetails.find((detail: any) => detail.target === 'patientslist');
        } else {
            this.patientlistAction = null;
        }
    }

    ngOnInit() {
        this.patientOwnerList();
    }


    patientOwnerList() {
        this._patientService.gtPatientList().subscribe((response) => {
            this.patientList = response.data;
            this.dataSource = new MatTableDataSource<PatientOwnerListDto>(
                this.patientList
            );
            setTimeout(() => {
                if (this.dataSource) {
                  this.dataSource.paginator = this.paginator;
                }
              }, 0);
              this.loader = false;
        });
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    addPanelOpen(): void {
        this.isUpdateButtonActive = false;
        const dialog = this._dialog
            .open(CreateEditPatientComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: null,
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.patientOwnerList();
                }
            });
    }

    public redirectToUpdate = (id: string) => {
        console.log(id);
        this.router.navigate(['/patientslist/patientdetails/', id]);
    };

    public redirectToDelete = (id: string) => {
        // const sweetAlertDto = new SweetAlertDto(
        //     this.translate('sweetalert.areYouSure'),
        //     this.translate('sweetalert.areYouSureDelete'),
        //     SweetalertType.warning
        // );
        // GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
        //     (swalResponse) => {
        //         if (swalResponse.isConfirmed) {
        //             const model = {
        //                 id: id,
        //             };
        //             this._unitsservice
        //                 .deleteUnits(model)
        //                 .subscribe((response) => {
        //                     if (response.isSuccessful) {
        //                         this.UnitsList();
        //                         const sweetAlertDto2 = new SweetAlertDto(
        //                             this.translate('sweetalert.success'),
        //                             this.translate('sweetalert.transactionSuccessful'),
        //                             SweetalertType.success
        //                         );
        //                         GeneralService.sweetAlert(sweetAlertDto2);
        //                     } else {
        //                         this.showSweetAlert('error', response.errors[0]);
        //                         console.log(response.errors[0]);
        //                     }
        //                 });
        //         }
        //     }
        // );
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

}
