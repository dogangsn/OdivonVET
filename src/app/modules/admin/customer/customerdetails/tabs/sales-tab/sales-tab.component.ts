import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { CustomerDataService } from '../../services/customer-data.service';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { TranslocoService } from '@ngneat/transloco';
import { SalesCustomerListDto } from './models/salesCustomerListDto';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { CustomerDetailsComponent } from '../../customerdetails.component';
import { EventService } from '../../services/event.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateEditSalesComponent } from '../../dialogs/collection/create-edit-sales/create-edit-sales.component';
import { SaleBuyService } from 'app/core/services/ratail/salebuy.service';
import { MatTableDataSource } from '@angular/material/table';
import { PayChartComponent } from '../../dialogs/pay-chart/pay-chart.component';
import { SalesDialogComponent } from '../../dialogs/sales-dialog/sales-dialog.component';
import { Observable, Subject, takeUntil, zip } from 'rxjs';
import { getSalesOwnerByIdList } from '../../dialogs/sales-dialog/models/getSalesOwnerByIdList.';

@Component({
  selector: 'app-sales-tab',
  templateUrl: './sales-tab.component.html',
  styleUrls: ['./sales-tab.component.css']
})
export class SalesTabComponent implements OnInit {

  @ViewChild('paginator') paginator: MatPaginator;

  displayedColumns: string[] = ['salesContent', 'amount', 'collection', 'rameiningBalance', 'actions'];
  dataSource: any;
  receivedCustomerId: string;
  salesCustomerLis: SalesCustomerListDto[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  action:any;
  salesActions:any;

  salesOwnerByIdList: getSalesOwnerByIdList;

  constructor(
    private _customerDataService: CustomerDataService,
    private _customerService: CustomerService,
    private _translocoService: TranslocoService,
    private customerDetailsComponent: CustomerDetailsComponent,
    private eventService: EventService,
    private _dialog: MatDialog,
    private _salebuyservice: SaleBuyService
  ) {
    this.eventService.dialogClosed.subscribe((status: boolean) => {
      if (status) {
        this.refreshSalesTab();
      }
    });

    const actions = localStorage.getItem('actions');
    if (actions) {
        this.action = JSON.parse(actions);
    }

    const customer = this.action.find((item: any) => {
        return item.roleSettingDetails.some((detail: any) => detail.target === 'customer');
    });

    if (customer) {
        this.salesActions = customer.roleSettingDetails.find((detail: any) => detail.target === 'customer');
    } else {
        this.salesActions = null;
    }

  }

  ngAfterViewInit() {
    this.getSalesCustomerList();

    this.customerDetailsComponent.salesAdded.subscribe(() => {
      this.refreshSalesTab();
    });
  }

  ngOnInit() {
    this.receivedCustomerId = this._customerDataService.getCustomerId();
    
  }

  refreshSalesTab(): void {
    const model = {
      customerId: this.receivedCustomerId,
    };

    this._customerService.getSalesCustomerList(model).subscribe({
      next: (response) => {
        this.salesCustomerLis = response.data;
        this.dataSource = new MatTableDataSource<SalesCustomerListDto>(
          this.salesCustomerLis
        );

        this.dataSource.paginator = this.paginator;

      },
      error: (err) => {
        console.error(err);
        this.showSweetAlert('error', 'Failed to load patient data.');
      }
    });
  }

  getSalesCustomerList(): void {
    const model = {
      customerId: this.receivedCustomerId,
    };

    this._customerService.getSalesCustomerList(model).subscribe({
      next: (response) => {
        this.salesCustomerLis = response.data;
        this.dataSource = new MatTableDataSource<SalesCustomerListDto>(
          this.salesCustomerLis
        );

        this.dataSource.paginator = this.paginator;

      },
      error: (err) => {
        console.error(err);
        this.showSweetAlert('error', 'Failed to load patient data.');
      }
    });
  }

  showSweetAlert(type: string, message: string): void {
    let sweetAlertDto: SweetAlertDto;

    if (type === 'success') {
      sweetAlertDto = new SweetAlertDto(
        this.translate('sweetalert.success'),
        message || this.translate('sweetalert.transactionSuccessful'),
        SweetalertType.success
      );
    } else {
      sweetAlertDto = new SweetAlertDto(
        this.translate('sweetalert.error'),
        message || this.translate('sweetalert.transactionFailed'),
        SweetalertType.error
      );
    }
    GeneralService.sweetAlert(sweetAlertDto);
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

  opencreateeditsales = (id: string) => {

    const item = this.salesCustomerLis.find(x => x.saleOwnerId == id)
    if (item != null) {

      const model = {
        customerId: this.receivedCustomerId,
        saleOwnerId: item.saleOwnerId,
        amount: item.rameiningBalance,
        collectionId: item.collectionId,
        data: null
      }
      console.log(model);
      const dialog = this._dialog
        .open(CreateEditSalesComponent, {
          maxWidth: '100vw !important',
          disableClose: true,
          data: model
        })
        .afterClosed()
        .subscribe((response) => {
          if (response.status) {
            this.getSalesCustomerList();
          }
        });


    }


  }

  public redirectToUpdate = (id: string) => {

    const model = {
      customerId: this.receivedCustomerId,
      data: null
    }

    const item = this.salesCustomerLis.find((x) => x.saleOwnerId === id);
    if (item) {

      const saleModel = {
        Id: item.saleOwnerId
      }

      zip(
        this.getSalesByIdQuery(saleModel)
      ).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (value) => {
          this.setSaleByIdQuery(value[0])
        },
        error: (e) => {
          console.log(e);
        },
        complete: () => {

          if (this.salesOwnerByIdList) {
            model.data = this.salesOwnerByIdList;
            const dialogRef = this._dialog.open(
              SalesDialogComponent,
              {
                minWidth: '800px',
                disableClose: true,
                data: model
              }
            );
            dialogRef.afterClosed().subscribe((response) => {
              if (response.status) {
                this.getSalesCustomerList();
              }
            });
          }

        }
      })
    };


  };

  public redirectToDelete = (id: string) => {

    const item = this.salesCustomerLis.find((x) => x.saleOwnerId === id);
    if (item.rameiningBalance === 0 && !item.isExaminations) {
      this.showSweetAlert('error', 'Tahsilat Olan Satış Silinemez. Tahsilatını Siliniz.');
      return;
    }

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
          this._salebuyservice
            .deletedSaleBuy(model)
            .subscribe((response) => {
              if (response.isSuccessful) {
                this.getSalesCustomerList();
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

  public openPayChart = (id: string) => {
    const model = {
      customerId: this.receivedCustomerId,
      saleBuyId: id
    }
    console.log(model);
    const dialog = this._dialog
      .open(PayChartComponent, {
        maxWidth: '100vw !important',
        disableClose: true,
        data: model
      })
      .afterClosed()
      .subscribe((response) => {
        if (response.status) {
          // this.getCustomerList();
        }
      });
  }

  getSalesByIdQuery(model: any): Observable<any> {
    return this._customerService.getSalesByIdQuery(model);
  }

  setSaleByIdQuery(response: any) {
    if (response.data) {
      this.salesOwnerByIdList = response.data;
    }
  }






}
