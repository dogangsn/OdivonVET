import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslocoService } from '@ngneat/transloco';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto'; 
import { PayChartListDto } from './model/PayChartListDto';

@Component({
    selector: 'app-pay-chart',
    templateUrl: './pay-chart.component.html',
    styleUrls: ['./pay-chart.component.css'],
})
export class PayChartComponent implements OnInit {

    // displayedColumns: string[] = [
    //     'date',
    //     'operation',
    //     'debit',
    //     'paid',
    //     'totalPaid',
    //     'total',
    //     'actions',
    // ];
    displayedColumns: string[] = [
        'date',
        'credit',
        'paid',
        'paymentName',
        'remark'
    ];
    @ViewChild('paginator') paginator: MatPaginator;

    selectedCustomerId: any;
    //payChartList: PayChartListDto[] = [];
    // dataSource = new MatTableDataSource<any>(this.payChartList);
    payChartList: PayChartListDto[] = [];
    dataSource = new MatTableDataSource<any>(this.payChartList);
    selectedsaleId : any;

    constructor(
        private _formBuilder: FormBuilder,
        private _dialogRef: MatDialogRef<any>,
        private _translocoService: TranslocoService,
        private _customerService: CustomerService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.selectedCustomerId = data.customerId;
        this.selectedsaleId = data.saleBuyId
    }

    ngOnInit() { 
        this.getPaymentTransactiopnList();
    }

    getPaymentTransactiopnList() {
        const model = {
            CustomerId: this.selectedCustomerId
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

    closeDialog(): void {
        this._dialogRef.close({ status: null });
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

    public redirectToDelete = (id: string) => {
        const sweetAlertDto = new SweetAlertDto(
            this.translate('sweetalert.areYouSure'),
            this.translate('sweetalert.areYouSureDelete'),
            SweetalertType.warning
        );
        GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
            (swalResponse) => {
                if (swalResponse.isConfirmed) {
                    const selectedPayChart = this.payChartList.find((item) => item.id == id);
                    if(selectedPayChart) {
                        const model = {
                            id: id,
                            appointmentId: selectedPayChart.appointmentId
                        };
                        this._customerService
                            .deletePayChart(model)
                            .subscribe((response) => {
                                if (response.isSuccessful) {
                                    this.getPaymentTransactiopnList();
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
            }
        );
    };

}
