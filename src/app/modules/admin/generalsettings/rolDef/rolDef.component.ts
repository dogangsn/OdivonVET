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
import { RoleSettingDto } from './models/RoleSettingDto';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { CreateEditRoleDefComponent } from './dialogs/create-edit-roleDef/create-edit-roleDef.component';
import { RolsService } from 'app/core/services/generalsettings/rols/rols.service';
import { CreateRoleSettingCommand } from './models/CreateRoleSettingCommand';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { TranslocoService } from '@ngneat/transloco';

@Component({
    selector: 'settings-rolDef',
    templateUrl: './rolDef.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsRolDefComponent implements OnInit, AfterViewInit {

 
    isUpdateButtonActive: boolean;
    notificationsForm: UntypedFormGroup;

    displayedColumns: string[] = ['rolecode', 'actions'];
    rolDef: FormGroup;

    @ViewChild('paginator') paginator: MatPaginator;
    rols: RoleSettingDto[] = [];
    dataSource = new MatTableDataSource<RoleSettingDto>(this.rols);

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _dialog: MatDialog,
        private _rolsSettings : RolsService,
        private _translocoService: TranslocoService
    ) {}

    ngOnInit(): void {
        this.getRolsist();
        this.dataSource.paginator = this.paginator; 
    }

    addPanelOpen(): void {
        const dialog = this._dialog
            .open(CreateEditRoleDefComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: null,
            })
            .afterClosed()
            .subscribe((response) => {
                debugger;
                if (response.status) {
                    // this.getUsersList();
                }
            });
    }

    getRolsist(): void {
        this._rolsSettings.getRolSettings().subscribe((response) => {
            this.rols = response.data;

            this.dataSource = new MatTableDataSource<RoleSettingDto>(
                this.rols
            );

            this.dataSource.paginator = this.paginator;
            console.log(this.dataSource);
        });
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    onPageChange(event) {
 
      }


      public redirectToUpdate = (id: string) => {
        this.isUpdateButtonActive = true;
        const selectedItem = this.rols.find((rol) => rol.id === id);

        if(selectedItem.isEnterpriseAdmin){
            const sweetAlertDto = new SweetAlertDto(
                this.translate('sweetalert.error'),
                'Admin Yetkisi Güncelleme Yapılamaz',
                SweetalertType.warning
            );
            GeneralService.sweetAlert(sweetAlertDto);
            return;
        }


        if (selectedItem) {
            const dialogRef = this._dialog.open(
                CreateEditRoleDefComponent,
                {
                    maxWidth: '100vw !important',
                    disableClose: true,
                    data: selectedItem
                }
            );

            dialogRef.afterClosed().subscribe((response) => {
                if (response.status) {
                    this.getRolsist();
                }
            });
        }
    };

    public redirectToDelete = (id: string) => {

        const selectedItem = this.rols.find((rol) => rol.id === id);

        if(selectedItem.isEnterpriseAdmin){
            const sweetAlertDto = new SweetAlertDto(
                this.translate('sweetalert.error'),
                'Admin Yetkisi Silinemez...',
                SweetalertType.warning
            );
            GeneralService.sweetAlert(sweetAlertDto);
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
                    this._rolsSettings
                        .deleteRols(model)
                        .subscribe((response) => {
                            if (response.isSuccessful) {
                                this.getRolsist();
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
