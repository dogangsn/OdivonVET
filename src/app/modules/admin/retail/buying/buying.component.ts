import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { SaleBuyListDto } from '../model/SaleBuyListDto';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { CreateEditSalesBuyComponent } from '../create-edit-sales/create-edit-salesbuy.component';
import { SaleBuyService } from 'app/core/services/ratail/salebuy.service';
import { CreateEditBuyOrderComponent } from '../create-edit-buying-order/create-edit-buying-order.component';
import { LogViewComponent } from '../../commonscreen/log-view/log-view.component';


@Component({
    selector: 'buying',
    templateUrl: './buying.component.html',
})
export class BuyingComponent implements OnInit, AfterViewInit {

    displayedColumns: string[] = [
        'date',
        'invoiceNo',
        'supplierName',
        'payment',
        'productName',
        'amount',
        'netPrice',
        'kdv',
        // 'discount',
        'total',
        'actions',
    ];
    loader = true;
    items = Array(13);
    action: any;
    buyingListAct: any;

    @ViewChild('paginator') paginator: MatPaginator;

    salebuyList: SaleBuyListDto[] = [];
    dataSource = new MatTableDataSource<SaleBuyListDto>(this.salebuyList);
    isUpdateButtonActive: boolean;




    constructor(
        private _dialog: MatDialog,
        private _translocoService: TranslocoService,
        private _salebuyservice: SaleBuyService,
    ) {
        const actions = localStorage.getItem('actions');
        if (actions) {
            this.action = JSON.parse(actions);
        }

        const buyingAct = this.action.find((item: any) => {
            return item.roleSettingDetails.some((detail: any) => detail.target === 'buying');
        });

        if (buyingAct) {
            this.buyingListAct = buyingAct.roleSettingDetails.find((detail: any) => detail.target === 'buying');
        } else {
            this.buyingListAct = null;
        }
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    ngOnInit() {
        this.getSaleBuy();
    }

    getSaleBuy(): void {

        const model = {
            type: 2
        };
        this._salebuyservice.getBuySaleList(model).subscribe((response) => {
            this.salebuyList = response.data;
            console.log(this.salebuyList);

            this.dataSource = new MatTableDataSource<SaleBuyListDto>(
                this.salebuyList
            );

            this.dataSource.paginator = this.paginator;
            setTimeout(() => {
                if (this.dataSource) {
                    this.dataSource.paginator = this.paginator;
                }
            }, 0);
            this.loader = false;
            console.log(this.salebuyList);
        });
    }

    createsales(): void {
        const model = {
            selectedsalebuy: null,
            visibleCustomer: false,
            salebuyType: 2, //satis
            isSupplier: true,
        };

        const dialog = this._dialog
            .open(CreateEditSalesBuyComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: model,
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.getSaleBuy();
                }
            });
    }

    createSupplierSales(): void {
        const model = {
            selectedsalebuy: null,
            visibleCustomer: false,
            salebuyType: 2, //satis
            isSupplier: true,
        };

        const dialog = this._dialog
            .open(CreateEditSalesBuyComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: model,
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.getSaleBuy();
                }
            });
    }

    createBuyingOrder(): void {
        const model = {
            selectedsalebuy: null,
            visibleCustomer: false,
            salebuyType: 2, //satis
            isSupplier: true,
        };

        const dialog = this._dialog
            .open(CreateEditBuyOrderComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: model,
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.getSaleBuy();
                }
            });
    }

    public redirectToUpdate = (id: string) => {
        this.isUpdateButtonActive = true;
        const selectedSaleBuy = this.salebuyList.find((salebuy) => salebuy.id === id);
        if (selectedSaleBuy) {
            const model = {
                selectedsalebuy: selectedSaleBuy,
                visibleCustomer: selectedSaleBuy.customerId === '00000000-0000-0000-0000-000000000000' ? false : true,
                salebuyType: 2, 
                isSupplier: true,
            };
            const dialogRef = this._dialog.open(
                CreateEditSalesBuyComponent,
                {
                    maxWidth: '100vw !important',
                    disableClose: true,
                    data: model
                }
            );
            dialogRef.afterClosed().subscribe((response) => {
                if (response.status) {
                    this.getSaleBuy();
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

                    const selectedSaleBuy = this.salebuyList.find((salebuy) => salebuy.id === id);
                    if (selectedSaleBuy) {
                        const model = {
                            id: id,
                            allSaleDeleted: false,
                            ownerId: selectedSaleBuy.ownerId,
                        };
                        this._salebuyservice
                            .deletedSaleBuy(model)
                            .subscribe((response) => {
                                if (response.isSuccessful) {
                                    this.getSaleBuy();
                                    const sweetAlertDto2 = new SweetAlertDto(
                                        this.translate('sweetalert.success'),
                                        this.translate(
                                            'sweetalert.transactionSuccessful'
                                        ),
                                        SweetalertType.success
                                    );
                                    GeneralService.sweetAlert(sweetAlertDto2);
                                } else {
                                    console.error('Silme işlemi başarısız.');
                                }
                            });
                    }

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

    formatDate(date: string): string {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        };
        return new Date(date).toLocaleString('tr-TR', options);
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

    public AllDeleted = (id: string) => {
        const sweetAlertDto = new SweetAlertDto(
            this.translate('sweetalert.areYouSure'),
            this.translate('sweetalert.areYouSureDelete'),
            SweetalertType.warning
        );
        GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
            (swalResponse) => {
                if (swalResponse.isConfirmed) {
                    const selectedSaleBuy = this.salebuyList.find((salebuy) => salebuy.id === id);
                    if (selectedSaleBuy) {
                        const model = {
                            ownerId: selectedSaleBuy.ownerId,
                            allSaleDeleted: true
                        };
                        this._salebuyservice
                            .deletedSaleBuy(model)
                            .subscribe((response) => {
                                if (response.isSuccessful) {
                                    this.getSaleBuy();
                                    const sweetAlertDto2 = new SweetAlertDto(
                                        this.translate('sweetalert.success'),
                                        this.translate(
                                            'sweetalert.transactionSuccessful'
                                        ),
                                        SweetalertType.success
                                    );
                                    GeneralService.sweetAlert(sweetAlertDto2);
                                } else {
                                    console.error('Silme işlemi başarısız.');
                                }
                            });


                    }


                }
            }
        );
    };

}
