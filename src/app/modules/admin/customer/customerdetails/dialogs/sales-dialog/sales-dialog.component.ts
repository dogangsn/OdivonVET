import { EventService } from './../../services/event.service';
import { Component, Inject, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SalesDto } from './models/salesDto';
import { fuseAnimations } from '@fuse/animations';
import { v4 as uuidv4 } from 'uuid';
import { ProductDescriptionService } from 'app/core/services/definition/productdescription/productdescription.service';
import { ProductDescriptionsDto } from 'app/modules/admin/definition/productdescription/models/ProductDescriptionsDto';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { TaxesDto } from 'app/modules/admin/definition/taxes/models/taxesDto';
import { TaxisService } from 'app/core/services/definition/taxis/taxis.service';
import { Observable, Subject, takeUntil, zip } from 'rxjs';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { CreateSaleCommand } from './models/CreateSaleCommand';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { TranslocoService } from '@ngneat/transloco';
import { CreateEditSalesComponent } from '../collection/create-edit-sales/create-edit-sales.component';
import { UpdateSaleCommand } from './models/UpdateSaleCommand';
import { AccountingService } from 'app/core/services/accounting/accounting.service';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'DDD MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'DDD MMMM YYYY',
  },
};


@Component({
  selector: 'app-sales-dialog',
  templateUrl: './sales-dialog.component.html',
  styleUrls: ['./sales-dialog.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    {
      provide: MAT_DATE_FORMATS, useValue: MY_FORMATS
    },
  ],
  animations: fuseAnimations
})
export class SalesDialogComponent implements OnInit {

  @Output() salesAdded = new EventEmitter<any>();

  buttonDisabled = false;
  displayedColumns: string[] = ['product', 'quantity', 'unitPrice', 'discount', 'vat', 'total', 'taxTotal', 'actions'];
  dataSource: SalesDto[] = [{ id: uuidv4(), product: '', quantity: 1, unit: 'Adet', unitPrice: 0, discount: 0, vat: 'Yok', netPrice: 0, netVat: 0 }];

  products: ProductDescriptionsDto[] = [];
  taxisList: TaxesDto[] = [];

  selectedsales: any;

  destroy$: Subject<boolean> = new Subject<boolean>();
  formGroup: FormGroup;
  selectedCustomerId: any;
  stockcontrolmessage: string;
  discountedTotalAmount: number = 0;

  constructor(
    private _formBuilder: FormBuilder,
    private _dialogRef: MatDialogRef<any>,
    private _productdescriptionService: ProductDescriptionService,
    private _taxisService: TaxisService,
    private _customerService: CustomerService,
    private _translocoService: TranslocoService,
    private _accountingService: AccountingService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private eventService: EventService,
    private _dialog: MatDialog,
  ) {
    this.selectedCustomerId = data.customerId;
    this.selectedsales = data.data
  }

  ngOnInit() {

    zip(
      this.getTaxisList(),
      this.getProductList()
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (value) => {
        this.setTaxis(value[0]),
          this.setProductList(value[1])
      },
      error: (e) => {
        console.log(e);
      },
      complete: () => {
        this.fillFormData(this.selectedsales);
      }
    });

    this.formGroup = this._formBuilder.group({
      date: new FormControl(new Date()),
      remark: ['']
    });

  }

  fillFormData(selectSales: any) {

    if (this.selectedsales !== null) {
      this.formGroup.setValue({
        date: selectSales.date,
        remark: selectSales.remark
      });
      this.dataSource = [];
      this.dataSource = selectSales.trans;
      this.calculateTotalAmount();
    }
  }


  onProductSelectionChange(element: SalesDto): void {
    const selectedProduct = this.products.find(product => product.id === element.product);
    element.unitPrice = selectedProduct ? selectedProduct.sellingPrice : null;
    element.vat = selectedProduct ? selectedProduct.taxisId : null;
  }

  addRow() {
    const newRow: SalesDto = { id: uuidv4(), product: '', quantity: 1, unit: 'Adet', unitPrice: 0, discount: 0, vat: 'Yok', netPrice: 0, netVat: 0 };
    this.dataSource = [...this.dataSource, newRow];
  }

  closeDialog(): void {
    this._dialogRef.close({ status: null });
  }

  removeRow(element: SalesDto) {
    this.dataSource = this.dataSource.filter(e => e !== element);
  }

  calculateTotal(element: SalesDto): number {
    const price = element.quantity * element.unitPrice;
    const discount = element.discount || 0;
    let totalPrice = price - discount;

    let calcvat = 0;
    if (element.vat !== "Yok") {
      const price = element.quantity * element.unitPrice;
      const vatRate = this.taxisList.find(x => x.id === element.vat).taxRatio; //element.vat === '8%' ? 0.08 : element.vat === '18%' ? 0.18 : 0;
      const inculeKDV = this.products.find(x => x.id === element.product).sellingIncludeKDV;

      if (price > 0 && vatRate > 0) {
        if (inculeKDV) {
          let basePrice = price / (1 + (vatRate / 100))
          calcvat = price - basePrice;
          totalPrice = totalPrice - calcvat;
        } else {
          calcvat = (price * vatRate) / 100
          totalPrice = totalPrice;
        }
      }
    }
    element.netPrice = totalPrice;

    return totalPrice;
  }

  calculateSubtotal(): number {
    return this.dataSource.reduce((acc, element) => acc + (element.quantity * element.netPrice - (element.discount || 0)), 0);
  }

  calculateVatRow(element: SalesDto): number {
    if (element.vat !== "Yok") {
      const price = element.quantity * element.unitPrice;
      const vatRate = this.taxisList.find(x => x.id === element.vat).taxRatio;
      const includeKDV = this.products.find(x => x.id === element.product).sellingIncludeKDV;

      let calcvat = 0;
      if (price > 0 && vatRate > 0) {
        if (includeKDV) {
          const basePrice = price / (1 + (vatRate / 100));
          calcvat = price - basePrice;
        } else {
          calcvat = (price * vatRate) / 100;
        }
      }
      element.netVat = calcvat;

      return calcvat;
    }
  }

  calculateVat(): number {
    return this.dataSource.reduce((acc, element) => {
      if (element.vat !== "Yok") {
        const price = element.quantity * element.unitPrice;
        const vatRate = this.taxisList.find(x => x.id === element.vat).taxRatio;
        const includeKDV = this.products.find(x => x.id === element.product).sellingIncludeKDV;

        let calcvat = 0;
        if (price > 0 && vatRate > 0) {
          if (includeKDV) {
            const basePrice = price / (1 + (vatRate / 100));
            calcvat = price - basePrice;
          } else {
            calcvat = (price * vatRate) / 100;
          }
        }
        element.netVat = calcvat;

        return acc + calcvat;
      }
      return acc;
    }, 0);
  }

  calculateTotalAmount(): number {
    return this.calculateSubtotal() + this.calculateVat();
  }

  addOrUpdateSales(): void {
    this.buttonDisabled = true;
    this.selectedsales
      ? this.updateSales()
      : this.addSales(false);
  }

  getTaxisList(): Observable<any> {
    return this._taxisService.getTaxisList();
  }

  setTaxis(response: any): void {
    if (response.data) {
      this.taxisList = response.data;
    }
  }

  getProductList(): Observable<any> {
    const model = {
      ProductType: 1,
    };
    return this._productdescriptionService.getProductDescriptionFilters(model);
  }

  setProductList(response: any): void {
    if (response.data) {
      this.products = response.data;
      this.products = this.products.filter(x => x.active === true);
    }
  }

  getFormValueByName(formName: string): any {
    return this.formGroup.get(formName).value;
  }

  showSweetAlert(type: string, text: string): void {
    if (type === 'success') {
      const sweetAlertDto = new SweetAlertDto(
        this.translate('sweetalert.success'),
        this.translate(text),
        SweetalertType.success
      );
      GeneralService.sweetAlert(sweetAlertDto);
    } else {
      const sweetAlertDto = new SweetAlertDto(
        this.translate('sweetalert.error'),
        this.translate(text),
        SweetalertType.error
      );
      GeneralService.sweetAlert(sweetAlertDto);
    }
  }

  translate(key: string): any {
    return this._translocoService.translate(key);
  }

  addSales(isCollection: boolean): void {
    const productGuids = this.dataSource.map(item => item.product);
    const _model = {
      productIds: productGuids
    }
    zip(
      this.isStockControl(_model)
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (value) => {
        this.setStockControl(value[0])
      },
      error: (e) => {
        console.log(e);
      },
      complete: () => {

        if (this.stockcontrolmessage.length > 0) {
          const sweetAlertDto = new SweetAlertDto(
            this.translate('sweetalert.areYouSure'),
            this.stockcontrolmessage,
            SweetalertType.warning
          );
          GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
            (swalResponse) => {
              if (swalResponse.isConfirmed) {
                this.addNoControlSale(isCollection);
              } else {
                this.buttonDisabled = false;
              }
            }
          )
        } else {
          this.addNoControlSale(isCollection);
        }
      }
    });
  }

  updateSales(): void {
    const model = new UpdateSaleCommand();
    model.id = this.selectedsales.id;
    model.trans = this.dataSource;
    model.remark = this.getFormValueByName('remark');
    model.date = this.getFormValueByName('date');

    this._customerService
      .updateSale(model)
      .subscribe(
        (response) => {
          if (response.isSuccessful) {
            this.showSweetAlert(
              'success',
              'sweetalert.transactionSuccessful'
            );
            this._dialogRef.close({
              status: true,
            });

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
    this.salesAdded.emit();

  }

  addOrUpdateSalesCollection(): void {
    this.buttonDisabled = true;
    this.selectedsales
      ? this.updateSales()
      : this.addSales(true);
  }

  isStockControl(model: any): Observable<any> {
    return this._accountingService.isSaleProductControl(model);
  }

  setStockControl(response: any): void {
    if (response.data) {
      this.stockcontrolmessage = response.data;
    }
  }

  addNoControlSale(isCollection: boolean): void {
    const model = new CreateSaleCommand();
    model.trans = this.dataSource;
    model.remark = this.getFormValueByName('remark');
    model.date = this.getFormValueByName('date');
    model.customerId = this.selectedCustomerId;
    this._customerService
      .saleCommand(model)
      .subscribe(
        (response) => {
          if (response.isSuccessful) {
            this.showSweetAlert(
              'success',
              'sweetalert.transactionSuccessful'
            );
            this._dialogRef.close({
              status: true,
            });

            if (isCollection) {
              const modelSale = {
                customerId: this.selectedCustomerId,
                saleOwnerId: response.data.id,
                amount: response.data.amount,
                data: null
              }
              this._dialog
                .open(CreateEditSalesComponent, {
                  maxWidth: '100vw !important',
                  disableClose: true,
                  data: modelSale
                })
                .afterClosed()
                .subscribe((response) => {
                  if (response.status) {
                    this.eventService.dialogClosed.emit(true);
                  }
                });
            }
          } else {
            this.showSweetAlert(
              'error',
              'sweetalert.transactionFailed'
            );
          }
        },
        (err) => {
          console.log(err);
          this.buttonDisabled = false;
        }
      );
    this.salesAdded.emit();
  }


  applyDiscount() {
    const subtotal = this.calculateSubtotal();
    const vat = this.calculateVat();
    const totalAmount = subtotal + vat;
    const discountAmount = totalAmount * 0.25;
    this.discountedTotalAmount = discountAmount;
  }


}
