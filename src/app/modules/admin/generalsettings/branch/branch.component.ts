import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CreateEditBranchComponent } from './dialog/create-edit-branch/create-edit-branch.component';
import { MatDialog } from '@angular/material/dialog';
import { BranchDto } from './models/BranchDto';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslocoService } from '@ngneat/transloco';
import { BranchService } from 'app/core/services/generalsettings/branch/branch.service';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';

@Component({
  selector: 'settings-branch',
  templateUrl: './branch.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchComponent implements OnInit, AfterViewInit {
  branchList: BranchDto[] = [];
  isUpdateButtonActive: boolean;
  displayedColumns: string[] = ['name'
    , 'district'
    , 'address'
    , 'phone'
    , 'actions'];
  @ViewChild('paginator') paginator: MatPaginator;
  dataSource = new MatTableDataSource<BranchDto>(this.branchList);
  constructor(
    private _dialog: MatDialog,
    private branchService: BranchService,
    private _translocoService: TranslocoService
  ) { }

  ngOnInit() {
    this.getBranchList();
    this.dataSource.paginator = this.paginator;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  addPanelOpen(): void {
    const dialog = this._dialog
      .open(CreateEditBranchComponent, {
        maxWidth: '100vw !important',
        disableClose: true,
        data: null,
      })
      .afterClosed()
      .subscribe((response) => {
        if (response.status) {
          this.getBranchList();
        }
      });
  }

  getBranchList(): void {
    this.branchService.getBranchList().subscribe((response) => {
      this.branchList = response.data;
      this.dataSource = new MatTableDataSource<BranchDto>(
        this.branchList
      );
      this.dataSource.paginator = this.paginator;
    });
  }

  public redirectToUpdate = (id: string) => {
    this.isUpdateButtonActive = true;
    const selectedItem = this.branchList.find((rol) => rol.id === id);

    if (selectedItem) {
      const dialogRef = this._dialog.open(
        CreateEditBranchComponent,
        {
          maxWidth: '100vw !important',
          disableClose: true,
          data: selectedItem
        }
      );
      dialogRef.afterClosed().subscribe((response) => {
        if (response.status) {
          this.getBranchList();
        }
      });
    }
  };

  public redirectToDelete = (id: string) => {

    const selectedItem = this.branchList.find((item) => item.id === id);

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
          this.branchService
            .deleteBranch(model)
            .subscribe((response) => {
              if (response.isSuccessful) {
                this.getBranchList();
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

  translate(key: string): any {
    return this._translocoService.translate(key);
  }

}
