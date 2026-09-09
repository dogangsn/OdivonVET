import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { CreateEditSmsParameterDialogComponent } from './dialogs/create-edit-smsparameters';
import { ParametersService } from 'app/core/services/settings/parameters.service';
import { SmsParametersDto } from './models/smsParameterDto';
import { Observable, Subject, pipe, takeUntil, zip } from 'rxjs';

@Component({
    selector: 'app-smsparameters',
    templateUrl: './smsparameters.component.html',
    styleUrls: ['./smsparameters.component.css']
})
export class SmsparametersComponent implements OnInit {

    selectedsmsparameters: SmsParametersDto;
    destroy$: Subject<boolean> = new Subject<boolean>();
    constructor(
        private _dialog: MatDialog,
        private _translocoService: TranslocoService,
        private _parametersService: ParametersService,
    ) {

    }

    ngOnInit() {
    }


    updatesms(type: number): void {

        zip(
            this.getSmsParamters(type)
        ).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (value) => {
                this.setProducesResponse(value[0])
            },
            error: (e) => {
                console.log(e);
            },
            complete: () => {

                const model = {
                    smsparameterstype: type,
                    selectedsmsparameters: this.selectedsmsparameters
                }
                const dialog = this._dialog
                    .open(CreateEditSmsParameterDialogComponent, {
                        maxWidth: '100vw !important',
                        disableClose: true,
                        data: model,
                    })
                    .afterClosed()
                    .subscribe((response) => {
                        if (response.status) {

                        }
                    });

            }
        });

        // const item = {
        //   smsIntegrationType: type
        // };
        // this._parametersService.getSmsParametersIdBy(item).subscribe(
        //   (response) => {
        //     if (response.isSuccessful) {
        //       this.selectedsmsparameters = response.data;
        //     } else {
        //       this.showSweetAlert('error');
        //     }
        //   },
        //   (err) => {
        //     console.log(err);
        //   }
        // );

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


    getSmsParamters(type: number): Observable<any> {
        const item = {
            smsIntegrationType: type
        };
        return this._parametersService.getSmsParametersIdBy(item);
    }

    setProducesResponse(response: any): void {
        this.selectedsmsparameters = response.data;
    }

}
