import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormGroup,
    UntypedFormBuilder,
    UntypedFormGroup,
} from '@angular/forms';
import { UserListDto } from './models/UserListDto';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { UsersService } from 'app/core/services/settings/users/users.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateEditUsersDialogComponent } from './dialogs/create-edit-users';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { TranslocoService } from '@ngneat/transloco';

@Component({
    selector: 'settings-authority',
    templateUrl: './authority.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsAuthorityComponent implements OnInit, AfterViewInit {
    users: FormGroup;

    pageSizeOptions = [5, 10, 20];
    pageSize = 5;
    pageIndex = 0;

    isUpdateButtonActive: boolean;

    displayedColumns: string[] = ['firstName', 'email', 'actions'];

    @ViewChild('paginator') paginator: MatPaginator;
    userlist: UserListDto[] = [];
    dataSource = new MatTableDataSource<UserListDto>(this.userlist);
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _usersService: UsersService,
        private _dialog: MatDialog,
        private _translocoService: TranslocoService,
    ) {}

    ngOnInit() {
        this.getUsersList();
        this.dataSource.paginator = this.paginator;
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    getUsersList(): void {
        this._usersService.getUsersList().subscribe((response) => {
            this.userlist = response.data;
            this.dataSource = new MatTableDataSource<UserListDto>(
                this.userlist
            );

            this.dataSource.paginator = this.paginator;
        });
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    addPanelOpen(): void {
        //this.erpfinancemonitorForm.reset();
        this.isUpdateButtonActive = false;
        const dialog = this._dialog
            .open(CreateEditUsersDialogComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: null,
            })
            .afterClosed()
            .subscribe((response) => {
                debugger;
                if (response.status) {
                    this.getUsersList();
                }
            });
    }

    onPageChange(event) {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
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

    public redirectToUpdate = (id: string) => {
        // this.isUpdateButtonActive = true;
        const selectedTile = this.userlist.find((users) => users.id === id);
        if (selectedTile) {
            const dialogRef = this._dialog.open(
                CreateEditUsersDialogComponent,
                {
                    maxWidth: '100vw !important',
                    disableClose: true,
                    data: selectedTile
                }
            );
            dialogRef.afterClosed().subscribe((response) => {
                if (response.status) {
                    this.getUsersList();
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
                    // this._titleService
                    //     .deleteTitle(model)
                    //     .subscribe((response) => {
                    //         if (response.isSuccessful) {
                    //             this.getTileList();
                    //             const sweetAlertDto2 = new SweetAlertDto(
                    //                 this.translate('sweetalert.success'),
                    //                 this.translate('sweetalert.transactionSuccessful'),
                    //                 SweetalertType.success
                    //             );
                    //             GeneralService.sweetAlert(sweetAlertDto2);
                    //         } else {
                    //             console.error('Silme işlemi başarısız.');
                    //         }
                    //     });
                }
            }
        );
    };


}
