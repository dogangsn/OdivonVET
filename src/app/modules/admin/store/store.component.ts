import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { StoreListDto } from './models/StoreListDto';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { StoreService } from 'app/core/services/store/store.service';
import { CreateEditStoreDialogComponent } from './dialogs/create-edit-store';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { TranslocoService } from '@ngneat/transloco';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';

@Component({
    selector: 'app-store',
    templateUrl: './store.component.html',
    styleUrls: ['./store.component.css'],
})
export class StoreComponent implements OnInit,AfterViewInit {
    displayedColumns: string[] = [
        'depotName',
        'depotCode',
        'active',
        'actions',
    ];
    @ViewChild('paginator') paginator: MatPaginator;

    storeList: StoreListDto[] = [];
    dataSource = new MatTableDataSource<StoreListDto>(this.storeList);
    isUpdateButtonActive: boolean;
    items = Array(13);
    loader = true;

    constructor(
        private _dialog: MatDialog,
        private _storeservice: StoreService,
        private _translocoService: TranslocoService
    ) {}

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    ngOnInit() {
        this.getStoreList();
    }

    getStoreList() {
        this._storeservice.getStoreList().subscribe((response) => {
            this.storeList = response.data;

            this.dataSource = new MatTableDataSource<StoreListDto>(
                this.storeList
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
            .open(CreateEditStoreDialogComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: null,
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.getStoreList();
                }
            });
    }

    public redirectToUpdate = (id: string) => {
        this.isUpdateButtonActive = true;
        const selectedStore = this.storeList.find((store) => store.id === id);
        if (selectedStore) {
            const dialogRef = this._dialog.open(
                CreateEditStoreDialogComponent,
                {
                    maxWidth: '100vw !important',
                    disableClose: true,
                    data: selectedStore
                }
            );

            dialogRef.afterClosed().subscribe((response) => {
                if (response.status) {
                    this.getStoreList();
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
                    this._storeservice
                        .deletedStores(model)
                        .subscribe((response) => {
                            if (response.isSuccessful) {
                                this.getStoreList();
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
    };

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

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
}
