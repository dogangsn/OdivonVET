import { CasingDefinitionService } from 'app/core/services/definition/CasingDefinition/casingdefinition.service';
import { casingDefinitionListDto } from './models/casingDefinitionListDto';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CreateEditCasingDefinitionDialogComponent } from './dialogs/create-edit-casingdefinition';
import { DeleteCasingDefinitionCommand } from "app/modules/admin/definition/casingdefinition/models/DeleteCasingDefinitionCommand";
import { UpdateCasingDefinitionCommand } from "app/modules/admin/definition/casingdefinition/models/UpdateCasingDefinitionCommand";
import { MatDialog } from '@angular/material/dialog';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { TranslocoService } from '@ngneat/transloco';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LogViewComponent } from '../../commonscreen/log-view/log-view.component';
@Component({
    selector: 'app-casingdefinition',
    templateUrl: './casingdefinition.component.html',
    styleUrls: ['./casingdefinition.component.css'],
    encapsulation: ViewEncapsulation.None,

})
export class CasingdefinitionComponent {
    displayedColumns: string[] = ['casename'
        , 'active'
        , 'actions',];
    casingDefinition: FormGroup;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    casingcards: casingDefinitionListDto[] = [];
    dataSource = new MatTableDataSource<casingDefinitionListDto>(this.casingcards);

    constructor(
        private _dialog: MatDialog,
        private _casingdefinitionService: CasingDefinitionService,
        private _translocoService: TranslocoService,
        // private _dialogRef: MatDialogRef<any>
    ) { }

    ngOnInit() {
        this.getCasingDefinition();
    }
    isUpdateButtonActive: boolean;

    getCasingDefinition() {
        this._casingdefinitionService.getCasingDefinitionList().subscribe((response) => {
            this.casingcards = response.data;
            console.log(this.casingcards);

            this.dataSource = new MatTableDataSource<casingDefinitionListDto>(
                this.casingcards
              );
              this.dataSource.paginator = this.paginator;

        });
    }
    addPanelOpen(): void {
        //this.erpfinancemonitorForm.reset();
        this.isUpdateButtonActive = false;
        const dialog = this._dialog
            .open(CreateEditCasingDefinitionDialogComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: null,
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.getCasingDefinition();
                }
            });

    }
    public redirectToUpdate = (id: string) => {
        this.isUpdateButtonActive = true;
        debugger;
        const selectedCase = this.casingcards.find((store) => store.id === id);
        if (selectedCase) {
            const dialogRef = this._dialog.open(
                CreateEditCasingDefinitionDialogComponent,
                {
                    maxWidth: '100vw !important',
                    disableClose: true,
                    data: selectedCase
                }
            );

            dialogRef.afterClosed().subscribe((response) => {
                if (response.status) {
                    this.getCasingDefinition();
                }
            });
        }
    };

    public redirectToDelete = (id?: string) => {

        const sweetAlertDto = new SweetAlertDto(
            this.translate('sweetalert.areYouSure'),
            this.translate('sweetalert.areYouSureDelete'),
            SweetalertType.warning
        );
        GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
            (swalResponse) => {
                if (swalResponse.isConfirmed) {
                    const casedefinitionItem = new DeleteCasingDefinitionCommand(id);
                    this._casingdefinitionService.deleteCasingDefinition(casedefinitionItem).subscribe(
                        (response) => {

                            if (response.isSuccessful) {
                                this.getCasingDefinition();
                                this.showSweetAlert('success');
                            } else {
                                this.showSweetAlert('error');
                            }
                        },
                        (err) => {
                            console.log(err);
                        }
                    );
                }
            })

    }
    getFormValueByName(formName: string): any {
        return this.casingDefinition.get(formName).value;
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
