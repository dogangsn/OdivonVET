import { suppliersListDto } from './models/suppliersListDto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { TranslocoService } from '@ngneat/transloco';

import { CasingDefinitionService } from 'app/core/services/definition/CasingDefinition/casingdefinition.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CreateEditSuppliersDialogComponent } from './dialogs/create-edit-suppliers';
import { DeleteCasingDefinitionCommand } from "app/modules/admin/definition/casingdefinition/models/DeleteCasingDefinitionCommand";
import { MatDialog } from '@angular/material/dialog';
import { SuppliersService } from 'app/core/services/suppliers/suppliers.service';
import { LogViewComponent } from '../commonscreen/log-view/log-view.component';

@Component({
    selector: 'app-suppliers',
    templateUrl: './suppliers.component.html',
    styleUrls: ['./suppliers.component.css']
})
export class SuppliersComponent {
    displayedColumns: string[] = ['suppliername'
        , 'email'
        , 'phone'
        , 'active'
        , 'actions',];
    suppliers: FormGroup;
    @ViewChild('paginator') paginator: MatPaginator;
    supplierscards: suppliersListDto[] = [];
    dataSource = new MatTableDataSource<suppliersListDto>(this.supplierscards);
    loader = true;
    items = Array(13);
    
    constructor(
        private _dialog: MatDialog,
        private _suppliersService: SuppliersService,
        private _translocoService: TranslocoService
    ) { }

    ngOnInit() {
        this.getSuppliers();
    }
    isUpdateButtonActive: boolean;

    getSuppliers() {
        this._suppliersService.getSuppliersList().subscribe((response) => {
            this.supplierscards = response.data;
            console.log(this.supplierscards);

            this.dataSource = new MatTableDataSource<suppliersListDto>(
                this.supplierscards
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
        //this.erpfinancemonitorForm.reset();
        this.isUpdateButtonActive = false;
        const dialog = this._dialog
            .open(CreateEditSuppliersDialogComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: null,
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.getSuppliers();
                }
            });

    }
    public redirectToUpdate = (id: string) => {
        debugger;
        this.isUpdateButtonActive = true;
        const selectedSupplier = this.supplierscards.find((supplier) => supplier.id === id);
        if (selectedSupplier) {
            const dialogRef = this._dialog.open(
                CreateEditSuppliersDialogComponent,
                {
                    maxWidth: '100vw !important',
                    disableClose: true,
                    data: selectedSupplier
                }
            );

            dialogRef.afterClosed().subscribe((response) => {
                if (response.status) {
                    this.getSuppliers();
                }
            });
        }
    };

    public redirectToDelete = (id?: string) => {

        const sweetAlertDto = new SweetAlertDto(
            this.translate('sweetalert.areYouSure'),
            this.translate('sweetalert.areYouSureDelete'),
            SweetalertType.warning
        );
        GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
            (swalResponse) => {
                if (swalResponse.isConfirmed) {
                    const suppliersItem = new DeleteCasingDefinitionCommand(id);
                    this._suppliersService.deleteSuppliers(suppliersItem).subscribe(
                        (response) => {

                            if (response.isSuccessful) {
                                this.getSuppliers();
                                this.showSweetAlert('success');
                            } else {
                                this.showSweetAlert('error');
                            }
                        },
                        (err) => {
                            console.log(err);
                        }
                    );
                }
            })
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

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
}

