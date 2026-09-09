import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductDescriptionService } from 'app/core/services/definition/productdescription/productdescription.service';
import { ProductMovementListDto } from '../../models/productMovementListDro';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-productmovement-list',
  templateUrl: './productmovement-list.component.html',
  styleUrls: ['./productmovement-list.component.css']
})
export class ProductmovementListComponent implements OnInit {

  displayedColumns: string[] = [
    'createDate',
    "remark",
    'piecequentity',
    'amount',
    'customersupplier'
  ];

  @ViewChild('paginator') paginator: MatPaginator;

  productMovementList: ProductMovementListDto[] = [];
  dataSource = new MatTableDataSource<ProductMovementListDto>(
    this.productMovementList
  );
  selectedProductId: string;

  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _productdescriptionService: ProductDescriptionService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    debugger;
    this.selectedProductId = data.productid;
  }

  ngOnInit() {
    if (this.selectedProductId.length > 0) {
      this.getProductMovementList();
    }
  }

  getProductMovementList(): void {
    const model = {
      ProductId: this.selectedProductId,
    };
    this._productdescriptionService
      .productMovementList(model)
      .subscribe((response) => {
        this.productMovementList = response.data;
        console.log(this.productMovementList);
        this.dataSource = new MatTableDataSource<ProductMovementListDto>(this.productMovementList);
        this.dataSource.paginator = this.paginator;
      });
  }

  closeDialog(): void {
    this._dialogRef.close({ status: null });
  }

  formatDate(date: string): string {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    };
    return new Date(date).toLocaleString('tr-TR', options);
}

}
