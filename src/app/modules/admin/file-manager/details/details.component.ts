import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { Item, Items } from '../models/file-manager.types';
import { FileManagerListComponent } from '../list/list.component';
import { FileManagerService } from 'app/core/services/file-manager/file-manager.service';
import { TranslocoService } from '@ngneat/transloco';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { Router } from '@angular/router';
import { RefreshService } from '../services/RefreshService';


@Component({
    selector: 'file-manager-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class FileManagerDetailsComponent implements OnInit, OnDestroy {
    
    @Output() refreshList: EventEmitter<void> = new EventEmitter<void>();
    
    item: Item;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fileManagerListComponent: FileManagerListComponent,
        private _fileManagerService: FileManagerService,
        private _translocoService: TranslocoService,
        private router: Router,
        private refreshService: RefreshService
    ) {

    }

    ngOnInit(): void {

        this._fileManagerListComponent.matDrawer.open();

        this._fileManagerService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: Item) => {

                this._fileManagerListComponent.matDrawer.open();

                this.item = item;

                this._changeDetectorRef.markForCheck();
            });

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._fileManagerListComponent.matDrawer.close();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
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

                    var model = {
                        id: this.item.id,
                    };
                    this._fileManagerService
                        .deleteFileManager(model)
                        .subscribe((response) => {
                            if (response.isSuccessful) {
                                //this.getExaminationList();
                        
                                const sweetAlertDto2 = new SweetAlertDto(
                                    this.translate('sweetalert.success'),
                                    this.translate(
                                        'sweetalert.transactionSuccessful'
                                    ),
                                    SweetalertType.success
                                );
                                GeneralService.sweetAlert(sweetAlertDto2);
                                this.refreshService.triggerRefreshList();
                                this.router.navigate(['file-manager/']);
                                this.closeDrawer();
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

    // public downloadFile = (id: string) => {

    //     var model = {
    //         id: id,
    //     };
    //     this._fileManagerService
    //         .downloadFileManager(model)
    //         .subscribe((response) => {
    //             if (response.isSuccessful) {

    //                 const blob = new Blob([response], { type: response.type });
    //                 const url = window.URL.createObjectURL(blob);
    //                 const a = document.createElement('a');
    //                 a.href = url;
    //                 a.click();
    //                 window.URL.revokeObjectURL(url);

    //             } else {
    //                 this.showSweetAlert(
    //                     'error',
    //                     response.errors[0]
    //                 );
    //                 console.log(response.errors[0]);
    //             }
    //         });


    // }
    public downloadFile = (id: string) => {

        const model = {
            id: id,
        };
    
        this._fileManagerService
            .downloadFileManager(model)
            .subscribe((response: Blob) => { 
                if (response) { 
                    const blob = new Blob([response], { type: response.type || 'application/octet-stream' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = this.item.name;
                    a.click();
                    window.URL.revokeObjectURL(url);
                } else {
                    this.showSweetAlert(
                        'error',
                        'Dosya indirilemedi.'
                    );
                    console.log('Dosya indirilemedi.');
                }
            });
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
}
