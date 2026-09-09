import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { PaymentMethodsDto } from './models/PaymentMethodsDto';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { CreateEditPaymentMethodsDialogComponent } from './dialogs/create-edit-paymentmethods';
import { PaymentMethodservice } from 'app/core/services/definition/paymentmethods/paymentmethods.service';
import { LogViewComponent } from '../../commonscreen/log-view/log-view.component';

@Component({
    selector: 'app-paymentmethods',
    templateUrl: './paymentmethods.component.html',
    styleUrls: ['./paymentmethods.component.css']
})
export class PaymentmethodsComponent implements OnInit {

    displayedColumns: string[] = ['name', 'remark', 'actions'];

    isUpdateButtonActive: boolean;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    payments: PaymentMethodsDto[] = [];
    dataSource = new MatTableDataSource<PaymentMethodsDto>(this.payments);

    constructor(
        private _dialog: MatDialog,
        private _translocoService: TranslocoService,
        private _paymentmethodsService: PaymentMethodservice,
    ) { }

    ngOnInit() {
        this.paymentsList();
    }


    paymentsList() {
        this._paymentmethodsService.getPaymentMethodsList().subscribe((response) => {
            this.payments = response.data;
            console.log(this.payments);

            
            this.dataSource = new MatTableDataSource<PaymentMethodsDto>(
                this.payments
              );
              this.dataSource.paginator = this.paginator;

        });
    }

    addPanelOpen(): void {
        this.isUpdateButtonActive = false;
        const dialog = this._dialog
            .open(CreateEditPaymentMethodsDialogComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: null,
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.paymentsList();
                }
            });
    }

    public redirectToUpdate = (id: string) => {
        this.isUpdateButtonActive = true;
        const selectedPayment = this.payments.find((pay) => pay.recId === id);
        if (selectedPayment) {
            const dialogRef = this._dialog.open(
                CreateEditPaymentMethodsDialogComponent,
                {
                    maxWidth: '100vw !important',
                    disableClose: true,
                    data: selectedPayment
                }
            );
            dialogRef.afterClosed().subscribe((response) => {
                if (response.status) {
                    this.paymentsList();
                }
            });
        }
    };

    public redirectToDelete = (id: number) => {
        const sweetAlertDto = new SweetAlertDto(
            this.translate('sweetalert.areYouSure'),
            this.translate('sweetalert.areYouSureDelete'),
            SweetalertType.warning
        );
        GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
            (swalResponse) => {
                if (swalResponse.isConfirmed) {
                    const model = {
                        recId: id,
                    };
                    this._paymentmethodsService
                        .deletedPaymentMethods(model)
                        .subscribe((response) => {
                            if (response.isSuccessful) {
                                this.paymentsList();
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
