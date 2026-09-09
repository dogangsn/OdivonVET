import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslocoService } from '@ngneat/transloco';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { PayChartListDto } from '../../dialogs/pay-chart/model/PayChartListDto';
import { CustomerDataService } from '../../services/customer-data.service';
import { CreateEditSalesComponent } from '../../dialogs/collection/create-edit-sales/create-edit-sales.component';

@Component({
    selector: 'app-pay-chart-tab',
    templateUrl: './paychart-tab.component.html',
    styleUrls: ['./paychart-tab.component.scss'],
})
export class PayChartTabComponent implements OnInit {

    displayedColumns: string[] = [
        'date',
        'credit',
        'paid',
        'paymentName',
        'remark',
        'actions',
    ];
    @ViewChild('paginator') paginator: MatPaginator;
    customerId: any;
    payChartList: PayChartListDto[] = [];
    dataSource = new MatTableDataSource<any>(this.payChartList);
    action:any;
    payChart:any;

    constructor(
        private _formBuilder: FormBuilder,
        private _translocoService: TranslocoService,
        private _customerService: CustomerService,
        private _customerDataService: CustomerDataService,
        private _dialog: MatDialog,
    ) {
        const actions = localStorage.getItem('actions');
        if (actions) {
            this.action = JSON.parse(actions);
        }

        const customer = this.action.find((item: any) => {
            return item.roleSettingDetails.some((detail: any) => detail.target === 'customer');
        });
    
        if (customer) {
            this.payChart = customer.roleSettingDetails.find((detail: any) => detail.target === 'customer');
        } else {
            this.payChart = null;
        }
    }

    ngOnInit() {
        this.customerId = this._customerDataService.getCustomerId();

    }

    ngAfterViewInit() {
        this.getPaymentTransactiopnList();
    }

    getPaymentTransactiopnList() {

        const model = {
            CustomerId: this.customerId
        }

        this._customerService
            .getPayChartList(model)
            .subscribe((response) => {
                this.payChartList = response.data;
                this.dataSource = new MatTableDataSource<PayChartListDto>(
                    this.payChartList
                );

                this.dataSource.paginator = this.paginator;

            });
    }

    formatDate(date: string): string {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        };
        return new Date(date).toLocaleString('tr-TR', options);
    }

    public redirectToUpdate = (id: string) => {

        const item = this.payChartList.find((item) => item.id === id);
        if (item) {
            const model = {
                customerId: this.customerId,
                saleOwnerId: item.saleBuyId,
                amount: item.credit,
                data : item
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
                    this.getPaymentTransactiopnList();
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
                    this._customerService
                        .deletePayChart(model)
                        .subscribe((response) => {
                            if (response.isSuccessful) {
                                this.getPaymentTransactiopnList();
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

    translate(key: string): any {
        return this._translocoService.translate(key);
    }

}