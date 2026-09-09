import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormGroup, UntypedFormGroup } from '@angular/forms';
import { TitleDefinationDto } from './model/titleDefinationDto';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { CreateEditTitleComponent } from './dialogs/create-edit-title';
import { TitleService } from 'app/core/services/generalsettings/title/title.service';

@Component({
    selector: 'app-title',
    templateUrl: './title.component.html',
    styleUrls: ['./title.component.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleComponent implements OnInit,AfterViewInit {
    titleForm: UntypedFormGroup;
    titleDef: FormGroup;

    @ViewChild('paginator') paginator: MatPaginator;
    title: TitleDefinationDto[] = [];
    dataSource = new MatTableDataSource<TitleDefinationDto>(this.title);

    displayedColumns: string[] = ['name', 'remark', 'actions'];

    constructor(
        private _dialog: MatDialog,
        private _translocoService: TranslocoService,
        private _titleService : TitleService,
    ) {}

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    ngOnInit() {
        this.getTileList();
    }

    addPanelOpen(): void {
        //this.erpfinancemonitorForm.reset();

        const dialog = this._dialog
            .open(CreateEditTitleComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: null,
            })
            .afterClosed()
            .subscribe((response) => {
                debugger;
                if (response.status) {
                    this.getTileList();
                }
            });
    }

    getTileList(): void {
        this._titleService.getTitleList().subscribe((response) => {
            this.title = response.data;
     
            this.dataSource = new MatTableDataSource<TitleDefinationDto>(
                this.title
            );

            this.dataSource.paginator = this.paginator;
            console.log(this.dataSource);
        });
    }


    public redirectToUpdate = (id: string) => {
        // this.isUpdateButtonActive = true;
        const selectedTile = this.title.find((title) => title.id === id);
        if (selectedTile) {
            const dialogRef = this._dialog.open(
                CreateEditTitleComponent,
                {
                    maxWidth: '100vw !important',
                    disableClose: true,
                    data: selectedTile
                }
            );
            dialogRef.afterClosed().subscribe((response) => {
                if (response.status) {
                    this.getTileList();
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
                    this._titleService
                        .deleteTitle(model)
                        .subscribe((response) => {
                            if (response.isSuccessful) {
                                this.getTileList();
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
}
