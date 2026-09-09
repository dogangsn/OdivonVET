import { Component, OnInit, ViewChild } from '@angular/core';
import { CreateeditPrinttemplateComponent } from './dialog/createedit-printtemplate.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { PrintTemplateListDto } from './models/printtemplatelistdto';
import { MatTableDataSource } from '@angular/material/table';
import { PrintTemplateService } from 'app/core/services/definition/printtemplate/printtemplate.service';
import { GeneralService } from 'app/core/services/general/general.service';
import { TranslocoService } from '@ngneat/transloco';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { LogViewComponent } from '../../commonscreen/log-view/log-view.component';
import { PreviewDialogComponent } from './PreviewDialog/PreviewDialog.component';

@Component({
  selector: 'app-printtemplate',
  templateUrl: './printtemplate.component.html',
  styleUrls: ['./printtemplate.component.css']
})
export class PrinttemplateComponent implements OnInit {

  displayedColumns: string[] = ['templatename', 'actions'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  printtemplate: PrintTemplateListDto[] = [];
  dataSource = new MatTableDataSource<PrintTemplateListDto>(
    this.printtemplate
  );

  constructor(
    private _dialog: MatDialog,
    private _printtemplate: PrintTemplateService,
    private _translocoService: TranslocoService,
  ) { }

  ngOnInit() {
    this.getPrintTemplateList();
  }

  getPrintTemplateList(): void {
    this._printtemplate.getPrintTemplateList().subscribe((response) => {
      this.printtemplate = response.data;
      this.dataSource = new MatTableDataSource<PrintTemplateListDto>(this.printtemplate);
      this.dataSource.paginator = this.paginator;
    });
  }

  addPanelOpen(): void {
    const dialog = this._dialog
      .open(CreateeditPrinttemplateComponent, {
        maxWidth: '100vw !important',
        disableClose: true,
        data: null,
      })
      .afterClosed()
      .subscribe((response) => {
        if (response.status) {
          this.getPrintTemplateList();
        }
      });
  }

  translate(key: string): any {
    return this._translocoService.translate(key);
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
          this._printtemplate
            .deletePrintTemplate(model)
            .subscribe((response) => {
              if (response.isSuccessful) {
                this.getPrintTemplateList();
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

  public redirectToUpdate = (id: string) => {

    const selecteditem = this.printtemplate.find((store) => store.id === id);
    if (selecteditem) {
      const dialogRef = this._dialog.open(
        CreateeditPrinttemplateComponent,
        {
          maxWidth: '100vw !important',
          disableClose: true,
          data: selecteditem
        }
      );

      dialogRef.afterClosed().subscribe((response) => {
        if (response.status) {
          this.getPrintTemplateList();
        }
      });
    }
  };

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

  openPreview = (id: string) => {

    const selecteditem = this.printtemplate.find((store) => store.id === id);
    if(selecteditem) {
      const dialogRef = this._dialog.open(PreviewDialogComponent, {
        maxWidth: '100vw !important',
        data: { content: selecteditem.htmlContent }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        console.log('Preview dialog closed');
      });
    }
  }


}
