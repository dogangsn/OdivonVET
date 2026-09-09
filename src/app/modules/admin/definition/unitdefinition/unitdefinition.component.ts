import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateEditUnitDefinitionDialogComponent } from './dialogs/create-edit-unitdefinition';
import { MatPaginator } from '@angular/material/paginator';
import { unitdefinitionListDto } from './models/unitdefinitionListDto';
import { MatTableDataSource } from '@angular/material/table';
import { UnitsService } from 'app/core/services/definition/unitdefinition/units.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { TranslocoService } from '@ngneat/transloco';
import { LogViewComponent } from '../../commonscreen/log-view/log-view.component';

@Component({
    selector: 'app-Unit',
    templateUrl: './unitdefinition.component.html',
    styleUrls: ['./unitdefinition.component.scss'],
})
export class UnitComponent implements OnInit {
    displayedColumns: string[] = ['unitCode', 'unitName', 'actions'];
    @ViewChild('paginator') paginator: MatPaginator;

    isUpdateButtonActive: boolean;
    units: unitdefinitionListDto[] = [];
    dataSource = new MatTableDataSource<unitdefinitionListDto>(this.units);
    loader = true;
    items = Array(13);
    action:any;
    unitdefinitionsAction:any;

    constructor(
        private _dialog: MatDialog,
        private _unitsservice: UnitsService,
        private _translocoService: TranslocoService,
    ) {
        const actions = localStorage.getItem('actions');
        if (actions) {
            this.action = JSON.parse(actions);
        }
    
        const appointment = this.action.find((item: any) => {
            return item.roleSettingDetails.some((detail: any) => detail.target === 'unitdefinition');
        });
    
        if (appointment) {
            this.unitdefinitionsAction = appointment.roleSettingDetails.find((detail: any) => detail.target === 'unitdefinition');
        } else {
            this.unitdefinitionsAction = null;
        }
     }

    ngOnInit() {
        this.UnitsList();
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }


    UnitsList() {
        this._unitsservice.getUnitsList().subscribe((response) => {
            this.units = response.data;
            console.log(this.units);

            this.dataSource = new MatTableDataSource<unitdefinitionListDto>(
                this.units
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
        this.isUpdateButtonActive = false;
        const dialog = this._dialog
            .open(CreateEditUnitDefinitionDialogComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: null,
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.UnitsList();
                }
            });
    }

    public redirectToUpdate = (id: string) => {
        this.isUpdateButtonActive = true;
        const selectedStore = this.units.find((units) => units.id === id);
        if (selectedStore) {
            const dialogRef = this._dialog.open(
                CreateEditUnitDefinitionDialogComponent,
                {
                    maxWidth: '100vw !important',
                    disableClose: true,
                    data: selectedStore
                }
            );
            dialogRef.afterClosed().subscribe((response) => {
                if (response.status) {
                    this.UnitsList();
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
                    this._unitsservice
                        .deleteUnits(model)
                        .subscribe((response) => {
                            if (response.isSuccessful) {
                                this.UnitsList();
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
