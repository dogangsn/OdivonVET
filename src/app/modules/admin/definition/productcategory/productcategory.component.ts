import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateEditProductCategoriesDialogComponent } from './dialogs/create-edit-productcategory';
import { ProductCategoryService } from 'app/core/services/definition/ProductCategories/productcategory.service';
import { ProductCategoriesListDto } from './models/ProductCategoriesListDto';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { TranslocoService } from '@ngneat/transloco';
import { LogViewComponent } from '../../commonscreen/log-view/log-view.component';

@Component({
    selector: 'app-productcategory',
    templateUrl: './productcategory.component.html',
    styleUrls: ['./productcategory.component.css'],
})
export class ProductcategoryComponent implements OnInit {
    displayedColumns: string[] = [ 'name', 'categoryCode', 'actions'];

    @ViewChild(MatPaginator) paginator: MatPaginator;
    productcategories: ProductCategoriesListDto[] = [];
    dataSource = new MatTableDataSource<ProductCategoriesListDto>(
        this.productcategories
    );
    isUpdateButtonActive: boolean;

    constructor(
        private _dialog: MatDialog,
        private _productcategoryservice: ProductCategoryService,
        private _translocoService: TranslocoService
        ) {

        }

    ngOnInit() {
        this.ProductCategoryList();
    }

    ProductCategoryList() {
        this._productcategoryservice
            .getProductCategoryList()
            .subscribe((response) => {
                this.productcategories = response.data;
                console.log(this.productcategories);

                this.dataSource = new MatTableDataSource<ProductCategoriesListDto>(
                    this.productcategories
                  );
                  this.dataSource.paginator = this.paginator;

            });
    }

    addPanelOpen(): void {
        this.isUpdateButtonActive = false;
        const dialog = this._dialog
            .open(CreateEditProductCategoriesDialogComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: null,
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.ProductCategoryList();
                }
            });
    }

    public redirectToUpdate = (id: string) => {
debugger
        this.isUpdateButtonActive = true;
        const selectedStore = this.productcategories.find((productcat) => productcat.id === id);
        if (selectedStore) {
            const dialogRef = this._dialog.open(
                CreateEditProductCategoriesDialogComponent,
                {
                    maxWidth: '100vw !important',
                    disableClose: true,
                    data: selectedStore
                }
            );

            dialogRef.afterClosed().subscribe((response) => {
                if (response.status) {
                    this.ProductCategoryList();
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
                    this._productcategoryservice
                        .deleteProductCategory(model)
                        .subscribe((response) => {
                            if (response.isSuccessful) {
                                this.ProductCategoryList();
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
