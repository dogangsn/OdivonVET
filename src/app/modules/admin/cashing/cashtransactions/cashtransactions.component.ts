import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { PaymentMethodsDto } from '../../definition/paymentmethods/models/PaymentMethodsDto';
import { PaymentMethodservice } from 'app/core/services/definition/paymentmethods/paymentmethods.service';
import { MatPaginator } from '@angular/material/paginator';
import { SaleBuyListDto } from '../../retail/model/SaleBuyListDto';
import { MatTableDataSource } from '@angular/material/table';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { TranslocoService } from '@ngneat/transloco';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SaleBuyService } from 'app/core/services/ratail/salebuy.service';

import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { Observable, Subject, takeUntil, zip } from 'rxjs';
const moment = _rollupMoment || _moment;
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
    selector: 'app-cashtransactions',
    templateUrl: './cashtransactions.component.html',
    styleUrls: ['./cashtransactions.component.css'],
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
})



export class CashtransactionsComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        'date',
        'type',
        'invoiceNo',
        'supplierName',
        'customerName',
        'productName',
        'payment',
        'netPrice',
        'kdv',
        'discount',
        'total',
        'actions',
    ];
    @ViewChild(MatPaginator) paginator: MatPaginator;

    formGroup: FormGroup;

    salebuyLists: SaleBuyListDto[] = [];
    dataSource = new MatTableDataSource<SaleBuyListDto>(this.salebuyLists);
    isUpdateButtonActive: boolean;

    payments: PaymentMethodsDto[] = [];
    action:any;
    cashtransactionsAct:any;
    destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private _paymentmethodsService: PaymentMethodservice,
        private _translocoService: TranslocoService,
        private _formBuilder: FormBuilder,
        private _salebuyservice: SaleBuyService,
    ) {

        const actions = localStorage.getItem('actions');
        if (actions) {
            this.action = JSON.parse(actions);
        }

        const cashtransactionAct = this.action.find((item: any) => {
            return item.roleSettingDetails.some((detail: any) => detail.target === 'cashtransactions');
        });
    
        if (cashtransactionAct) {
            this.cashtransactionsAct = cashtransactionAct.roleSettingDetails.find((detail: any) => detail.target === 'cashtransactions');
        } else {
            this.cashtransactionsAct = null;
        }

        this.formGroup = this._formBuilder.group({
            begindate: new FormControl(this.calculateEndDate()), // Bugünün tarihi
            endDate: new FormControl(new Date()), // Yedi gün önceki tarih
            paymenttype: ['all'],
        });


    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    ngOnInit() {


        zip(
            this.paymentsList(),
        ).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (value) => {
                this.setpaymentList(value[0])
            },
            error: (e) => {
                console.log(e);
            },
            complete: () => {
                this.getRecordFilter();
            }
        });
    }

    calculateEndDate(): Date {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return sevenDaysAgo;
    }



    public redirectToUpdate = (id: string) => {
        this.isUpdateButtonActive = true;
        // const selectedStore = this.storeList.find((store) => store.id === id);
        // if (selectedStore) {
        //     const dialogRef = this._dialog.open(
        //         CreateEditStoreDialogComponent,
        //         {
        //             maxWidth: '100vw !important',
        //             disableClose: true,
        //             data: selectedStore
        //         }
        //     );

        //     dialogRef.afterClosed().subscribe((response) => {
        //         if (response.status) {
        //             this.getStoreList();
        //         }
        //     });
        // }
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
                    this._salebuyservice
                        .deletedSaleBuy(model)
                        .subscribe((response) => {
                            if (response.isSuccessful) {
                                this.getRecordFilter();
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

    getRecordFilter() {

        var paymentypeId = this.getFormValueByName("paymenttype");
        debugger;

        const model = {
            paymentType: (paymentypeId == 'all' ? 0 : paymentypeId),
            beginDate: this.getFormValueByName("begindate"),
            endDate: this.getFormValueByName("endDate")
        }
        this._salebuyservice.getBuySaleFilterList(model).subscribe((response) => {
            this.salebuyLists = response.data;
            console.log(this.salebuyLists);


            this.dataSource = new MatTableDataSource<SaleBuyListDto>(this.salebuyLists);

            this.dataSource.paginator = this.paginator;
            console.log(this.payments);
        });

    }

    getFormValueByName(formName: string): any {
        return this.formGroup.get(formName).value;
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

    paymentsList(): Observable<any> {
        return this._paymentmethodsService.getPaymentMethodsList();

    }

    setpaymentList(response: any): void {
        if (response.data) {
            this.payments = response.data;
        }
    }


}
