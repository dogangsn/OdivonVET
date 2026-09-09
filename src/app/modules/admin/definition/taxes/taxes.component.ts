import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { TaxesDto } from './models/taxesDto';
import { MatTableDataSource } from '@angular/material/table';
import { CreateEditTaxesComponent } from './dialogs/create-edit-taxes.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { TaxisService } from 'app/core/services/definition/taxis/taxis.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { LogViewComponent } from '../../commonscreen/log-view/log-view.component';

@Component({
  selector: 'app-taxes',
  templateUrl: './taxes.component.html',
  styleUrls: ['./taxes.component.css']
})
export class TaxesComponent implements OnInit {

  displayedColumns: string[] = ['taxName', 'taxRatio', 'actions'];

  isUpdateButtonActive: boolean;
  @ViewChild('paginator') paginator: MatPaginator;
  taxisList: TaxesDto[] = [];
  dataSource = new MatTableDataSource<TaxesDto>(this.taxisList);
  action:any;
  taxesAction:any;

  constructor(
    private _dialog: MatDialog,
    private _translocoService: TranslocoService,
    private _taxisService: TaxisService
  ) { 
    const actions = localStorage.getItem('actions');
        if (actions) {
            this.action = JSON.parse(actions);
        }
    
        const appointment = this.action.find((item: any) => {
            return item.roleSettingDetails.some((detail: any) => detail.target === 'taxes');
        });
    
        if (appointment) {
            this.taxesAction = appointment.roleSettingDetails.find((detail: any) => detail.target === 'taxes');
        } else {
            this.taxesAction = null;
        }
  }

  ngOnInit() {
    this.getTaxisList();
  }

  getTaxisList(): void {
    this._taxisService.getTaxisList().subscribe((response) => {
      this.taxisList = response.data;
      this.dataSource = new MatTableDataSource<TaxesDto>(
        this.taxisList
      );
      this.dataSource.paginator = this.paginator;
    });
  }

  addPanelOpen(): void {
    this.isUpdateButtonActive = false;
    const dialog = this._dialog
      .open(CreateEditTaxesComponent, {
        maxWidth: '100vw !important',
        disableClose: true,
        data: null,
      })
      .afterClosed()
      .subscribe((response) => {
        if (response.status) {
          this.getTaxisList();
        }
      });
  }


  public redirectToUpdate = (id: string) => {
    this.isUpdateButtonActive = true;
    const selectedStore = this.taxisList.find((x) => x.id === id);
    if (selectedStore) {
        const dialogRef = this._dialog.open(
          CreateEditTaxesComponent,
            {
                maxWidth: '100vw !important',
                disableClose: true,
                data: selectedStore
            }
        );

        dialogRef.afterClosed().subscribe((response) => {
            if (response.status) {
                this.getTaxisList();
            }
        });
    }

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
          const model = {
            id: id,
          };
          this._taxisService
            .deleteTaxis(model)
            .subscribe((response) => {
              if (response.isSuccessful) {
                this.getTaxisList();
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

