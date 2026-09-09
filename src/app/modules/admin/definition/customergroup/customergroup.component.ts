import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CustomerGroupListDto } from './models/customerGroupListDto';
import { CreateEditCustomerGroupDialogComponent } from './dialogs/create-edit-customergroup';
import { CustomerGroupService } from 'app/core/services/definition/customergroup/customergroup.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { TranslocoService } from '@ngneat/transloco';
import { LogViewComponent } from '../../commonscreen/log-view/log-view.component';

@Component({
    selector: 'app-customergroup',
    templateUrl: './customergroup.component.html',
    styleUrls: ['./customergroup.component.css'],
})
export class CustomergroupComponent implements OnInit {
    displayedColumns: string[] = [ 'name', 'code', 'actions'];

    @ViewChild(MatPaginator) paginator: MatPaginator;
    customergroup: CustomerGroupListDto[] = [];
    dataSource = new MatTableDataSource<CustomerGroupListDto>(
        this.customergroup
    );
    isUpdateButtonActive: boolean;


    constructor(
        private _dialog: MatDialog,
        private _customergroup: CustomerGroupService,
        private _translocoService: TranslocoService
        ) {

        }

    ngOnInit() {
        this.CustomerGroupList();
    }

    CustomerGroupList() {
        this._customergroup
            .getcustomerGroupList()
            .subscribe((response) => {
                this.customergroup = response.data;
                console.log(this.customergroup);

                this.dataSource = new MatTableDataSource<CustomerGroupListDto>(
                    this.customergroup
                  );
                  this.dataSource.paginator = this.paginator;
            });
    }

    addPanelOpen(): void {
        this.isUpdateButtonActive = false;
        const dialog = this._dialog
            .open(CreateEditCustomerGroupDialogComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: null,
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.CustomerGroupList();
                }
            });
    }

    public redirectToUpdate = (id: string) => {
        this.isUpdateButtonActive = true;
        const selectedStore = this.customergroup.find((store) => store.id === id);
        if (selectedStore) {
            const dialogRef = this._dialog.open(
                CreateEditCustomerGroupDialogComponent,
                {
                    maxWidth: '100vw !important',
                    disableClose: true,
                    data: selectedStore
                }
            );

            dialogRef.afterClosed().subscribe((response) => {
                if (response.status) {
                    this.CustomerGroupList();
                }
            });
        }

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
                    this._customergroup
                        .deletedcustomerGroupDef(model)
                        .subscribe((response) => {
                            if (response.isSuccessful) {
                                this.CustomerGroupList();
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
    
    showSweetAlert(type: string): void {
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
                this.translate('sweetalert.transactionFailed'),
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
