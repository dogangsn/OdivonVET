import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { StockTrackingDto } from '../../models/stockTrackingDto';
import { MatTableDataSource } from '@angular/material/table';
import { StockTrackingService } from 'app/core/services/definition/stockTracking/stocktracking.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { TranslocoService } from '@ngneat/transloco';
import { StockTrackingType } from '../../models/createStockTrackingCommand';
import { CreateeditStockTrackingComponent } from '../createedit-stockTracking/createedit-stockTracking.component';

@Component({
  selector: 'app-stockTracking-list',
  templateUrl: './stockTracking-list.component.html',
  styleUrls: ['./stockTracking-list.component.css']
})
export class StockTrackingListComponent implements OnInit {

  displayedColumns: string[] = [
    'processTypeName',
    'supplierName',
    'expirationDateString',
    'purchasePrice',
    'piece',
    'remainingPiece',
    'actions',
  ];

  @ViewChild('paginator') paginator: MatPaginator;
  productdescription: StockTrackingDto[] = [];
  dataSource = new MatTableDataSource<StockTrackingDto>(
    this.productdescription
  );
  productid: string;

  constructor(
    private _dialog: MatDialog,
    private _dialogRef: MatDialogRef<any>,
    private _stocktracking: StockTrackingService,
    private _translocoService: TranslocoService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.productid = data.productid;

  }

  ngOnInit() {
    this.getStockTrackingList();
  }

  getStockTrackingList() {
    const model = {
      ProductId: this.productid,
    };
    this._stocktracking
      .getStockTrackingFilterProduct(model)
      .subscribe((response) => {
        this.productdescription = response.data;

        this.dataSource = new MatTableDataSource<StockTrackingDto>(this.productdescription);

        this.dataSource.paginator = this.paginator;
      });
  }

  closeDialog(): void {
    this._dialogRef.close({ status: null });
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
          this._stocktracking
            .deleteStockTracking(model)
            .subscribe((response) => {
              if (response.isSuccessful) {
                this.getStockTrackingList();
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

  public redirectToUpdate = (id: string) => {

    const selectedItem = this.productdescription.find((items) => items.id === id);
    if (selectedItem) {

      const data = {
        productid: id,
        entryexittype: StockTrackingType.Entry,
        data: selectedItem
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
            this.getStockTrackingList();
          }
        });

    }


  };

  getTotalPurchasePrice(): number {
    return this.dataSource.data.map(t => t.purchasePrice).reduce((acc, value) => acc + value, 0);
  }

  getTotalRemainingPiece(): number {
    return this.dataSource.data.map(t => t.remainingPiece).reduce((acc, value) => acc + value, 0);
  }

  getTotalPiece(): number {
    return this.dataSource.data.map(t => t.piece).reduce((acc, value) => acc + value, 0);
  }

}
