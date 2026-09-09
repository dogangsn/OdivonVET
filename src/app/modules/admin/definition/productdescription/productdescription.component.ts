import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateEditProductDescriptionDialogComponent } from './dialogs/create-edit-productdescription';
import { MatPaginator } from '@angular/material/paginator';
import { ProductDescriptionsDto } from './models/ProductDescriptionsDto';
import { MatTableDataSource } from '@angular/material/table';
import { ProductDescriptionService } from 'app/core/services/definition/productdescription/productdescription.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { TranslocoService } from '@ngneat/transloco';
import { ProductmovementListComponent } from './dialogs/productmovement-list/productmovement-list.component';
import { StockTrackingListComponent } from './dialogs/stockTracking-list/stockTracking-list.component';
import { CreateeditStockTrackingComponent } from './dialogs/createedit-stockTracking/createedit-stockTracking.component';
import { StockTrackingType } from './models/createStockTrackingCommand';
import { LogViewComponent } from '../../commonscreen/log-view/log-view.component';
import { MatChipListboxChange } from '@angular/material/chips';

@Component({
    selector: 'app-productdescription',
    templateUrl: './productdescription.component.html',
    styleUrls: ['./productdescription.component.css'],
})
export class ProductdescriptionComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        'warning',
        'active',
        'name',
        'productCode',
        'productBarcode',
        'buyingPrice',
        'sellingPrice',
        'stockCount',
        'actions',
    ];

    @ViewChild('paginator') paginator: MatPaginator;

    productdescription: ProductDescriptionsDto[] = [];
    dataSource = new MatTableDataSource<ProductDescriptionsDto>(
        this.productdescription
    );
    isUpdateButtonActive: boolean;
    visibleProductType: boolean;
    producttype: number;
    loader = true;
    items = Array(13);

    options = [
        { name: 'Akitf', selected: false, type: 1 },
        { name: 'Pasif', selected: false, type: 0 },
        { name: 'Tümü', selected: true, type: 2 }
    ];

    constructor(
        private _dialog: MatDialog,
        private _productdescriptionService: ProductDescriptionService,
        private _translocoService: TranslocoService
    ) { }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    ngOnInit() {
        this.getProductList();
    }

    getProductList() {
        const model = {
            ProductType: 1,
        };
        this._productdescriptionService
            .getProductDescriptionFilters(model)
            .subscribe((response) => {
                this.productdescription = response.data;
                console.log(this.productdescription);

                this.dataSource = new MatTableDataSource<ProductDescriptionsDto>(this.productdescription);
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
        this.visibleProductType = false;
        this.producttype = 1;

        const model = {
            selectedProductdescription: null,
            producttype: 1,
            visibleProductType: false,
        };

        const dialog = this._dialog
            .open(CreateEditProductDescriptionDialogComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: model,
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.getProductList();
                }
            });
    }

    public redirectToUpdate = (id: string) => {
        this.isUpdateButtonActive = true;
        this.visibleProductType = false;
        this.producttype = 1;

        const selectedProduct = this.productdescription.find(
            (product) => product.id === id
        );
        const model = {
            selectedProductdescription: selectedProduct,
            producttype: 1,
            visibleProductType: false,
        };
        if (selectedProduct) {
            const dialogRef = this._dialog.open(
                CreateEditProductDescriptionDialogComponent,
                {
                    maxWidth: '100vw !important',
                    disableClose: true,
                    data: model,
                }
            );

            dialogRef.afterClosed().subscribe((response) => {
                if (response.status) {
                    this.getProductList();
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
                    this._productdescriptionService
                        .deleteProductDescription(model)
                        .subscribe((response) => {
                            if (response.isSuccessful) {
                                this.getProductList();
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

    public redirectToMovement = (id: string) => {
        debugger;
        const model = {
            productid: id
        };

        const dialogRef = this._dialog.open(
            ProductmovementListComponent,
            {
                maxWidth: '100vw !important',
                disableClose: true,
                data: model,
            }
        );
        dialogRef.afterClosed().subscribe((response) => {
            if (response.status) {
                this.getProductList();
            }
        });
    }

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

    toggleActive(id: number, active: boolean) {

        console.log("Toggle event captured for element with id:", id);

        const item = {
            Id: id,
            Active: active
        };

        this._productdescriptionService.updateProductActive(item).subscribe(
            (response) => {

                if (response.isSuccessful) {

                } else {
                    this.showSweetAlert(
                        'error',
                        'sweetalert.transactionFailed'
                    );
                }
            },
            (err) => {
                console.log(err);
            }
        );


    }

    public openStockTrackingList = (id: string) => {

        const data = {
            productid: id,
        }

        const dialog = this._dialog
            .open(StockTrackingListComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: data,
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.getProductList();
                }
            });

    }

    public openStockTrackingEntry = (id: string, entryexittype: number) => {

        const selectedProduct = this.productdescription.find(
            (product) => product.id === id
        );

        const data = {
            productid: id,
            entryexittype: (entryexittype === 1 ? StockTrackingType.Entry : StockTrackingType.Exit),
            supplierId : (selectedProduct.supplierId == undefined || selectedProduct.supplierId == null ? '00000000-0000-0000-0000-000000000000' : selectedProduct.supplierId),
            data: null
        }

        const dialog = this._dialog
            .open(CreateeditStockTrackingComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: data,
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.getProductList();
                }
            });

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

    onChipsSelectionChange(event: MatChipListboxChange): void {
        const selectedValue = event.value;
        debugger
        console.log('Selected value:', selectedValue);
        this.filterVaccineList(selectedValue);
    }

    filterVaccineList(selectedValue: Number): void {
        debugger
        if (selectedValue === 2) {
            this.dataSource.data = this.productdescription;
          } else {
            this.dataSource.data = this.productdescription.filter(product => product.active === (selectedValue === 1));
          }
        this.dataSource.paginator = this.paginator; 
    }

}
