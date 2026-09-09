import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ProductDescriptionsDto } from '../productdescription/models/ProductDescriptionsDto';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ProductDescriptionService } from 'app/core/services/definition/productdescription/productdescription.service';
import { TranslocoService } from '@ngneat/transloco';
import { CreateEditProductDescriptionDialogComponent } from '../productdescription/dialogs/create-edit-productdescription';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { StockTrackingListComponent } from '../productdescription/dialogs/stockTracking-list/stockTracking-list.component';
import { CreateeditStockTrackingComponent } from '../productdescription/dialogs/createedit-stockTracking/createedit-stockTracking.component';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {

  displayedColumns: string[] = [
    'warning',
    'name',
    'sellingPrice',
    'actions',
];

@ViewChild('paginator') paginator: MatPaginator;
productdescription: ProductDescriptionsDto[] = [];
dataSource = new MatTableDataSource<ProductDescriptionsDto>(
    this.productdescription
);
isUpdateButtonActive: boolean;
visibleProductType: boolean;
producttype:number;

constructor(
    private _dialog: MatDialog,
    private _productdescriptionService: ProductDescriptionService,
    private _translocoService: TranslocoService, 
) {}

ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
}

ngOnInit() {
    this.getProductList();
}

getProductList() {
    const model = {
      ProductType: 3,
    };
    this._productdescriptionService
        .getProductDescriptionFilters(model)
        .subscribe((response) => {
            this.productdescription = response.data;
            console.log(this.productdescription);

            this.dataSource = new MatTableDataSource<ProductDescriptionsDto>(
                this.productdescription
            );

            this.dataSource.paginator = this.paginator;
        });
}

addPanelOpen(): void {
    //this.erpfinancemonitorForm.reset();
    this.isUpdateButtonActive = false;
    this.visibleProductType = true;
    this.producttype = 3;

    const model = {
        selectedProductdescription : null,
        producttype : 3,
        visibleProductType : true
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
    this.visibleProductType = true;
    this.producttype = 3;

    const selectedProduct = this.productdescription.find(
        (product) => product.id === id
    );
    const model = {
        selectedProductdescription: selectedProduct,
        producttype: 3,
        visibleProductType: true,
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

toggleActive(id: number, active: boolean) {

    console.log("Toggle event captured for element with id:", id);

    const item = {
        Id : id,
        Active : active
    };

    this._productdescriptionService.updateProductActive(item).subscribe(
        (response) => {

            if (response.isSuccessful) {
              
            } else {
                this.showSweetAlert(
                    'error'
                );
            }
        },
        (err) => {
            console.log(err);
        }
    );


}

}
