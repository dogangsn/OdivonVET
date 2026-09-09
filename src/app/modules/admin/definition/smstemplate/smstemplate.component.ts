import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { CreateeditSmstemplateComponent } from './dialog/createedit-smstemplate.component';
import { SmsTemplateListDto } from './models/smstemplatelistDto';
import { SmsTemplateService } from 'app/core/services/definition/SmsTemplate/smstemplate.service';
import { MatTableDataSource } from '@angular/material/table';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { TranslocoService } from '@ngneat/transloco';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { LogViewComponent } from '../../commonscreen/log-view/log-view.component';

@Component({
  selector: 'app-smstemplate',
  templateUrl: './smstemplate.component.html',
  styleUrls: ['./smstemplate.component.css']
})
export class SmstemplateComponent implements OnInit {

  
  displayedColumns: string[] = ['active', 'templateName','enableSMS',  'enableAppNotification', 'enableEmail', 'enableWhatsapp','actions'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  smstemplate: SmsTemplateListDto[] = [];
  dataSource = new MatTableDataSource<SmsTemplateListDto>(this.smstemplate);

  constructor(
    private _dialog: MatDialog,
    private _smstemplateService : SmsTemplateService,
    private _translocoService: TranslocoService,
  ) { 

  }

  ngOnInit() {
    this.getSmsTemplate();
  }

  getSmsTemplate() : void {
    this._smstemplateService.getSmsTemplate().subscribe((response) => {
      this.smstemplate = response.data;
      this.dataSource = new MatTableDataSource<SmsTemplateListDto>(
        this.smstemplate
      );
      this.dataSource.paginator = this.paginator;
    });
  }

  addPanelOpen(): void {
    const dialog = this._dialog
      .open(CreateeditSmstemplateComponent, {
        maxWidth: '100vw !important',
        disableClose: true,
        data: null,
      })
      .afterClosed()
      .subscribe((response) => {
        if (response.status) {
          this.getSmsTemplate();
        }
      });
  }

  translate(key: string): any {
    return this._translocoService.translate(key);
  }

  public redirectToUpdate = (id: string) => {
    // this.isUpdateButtonActive = true;
    const selectedStore = this.smstemplate.find((x) => x.id === id);
    if (selectedStore) {
        const dialogRef = this._dialog.open(
          CreateeditSmstemplateComponent,
            {
                maxWidth: '100vw !important',
                disableClose: true,
                data: selectedStore
            }
        );
        dialogRef.afterClosed().subscribe((response) => {
            if (response.status) {
                this.getSmsTemplate();
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
          this._smstemplateService
            .deleteSmsTemplate(model)
            .subscribe((response) => {
              if (response.isSuccessful) {
                this.getSmsTemplate();
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
