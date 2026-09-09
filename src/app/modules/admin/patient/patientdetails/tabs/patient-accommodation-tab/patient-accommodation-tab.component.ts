import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslocoService } from '@ngneat/transloco';
import { GeneralService } from 'app/core/services/general/general.service';
import { AccommodationsService } from 'app/core/services/pethotels/accommodations/accommodation.service';
import { LogViewComponent } from 'app/modules/admin/commonscreen/log-view/log-view.component';
import { CustomerDataService } from 'app/modules/admin/customer/customerdetails/services/customer-data.service';
import { AccommodationexitComponent } from 'app/modules/admin/pethotels/accommodations/dialog/accommodationexit/accommodationexit.component';
import { CreateEditAccommodationsComponent } from 'app/modules/admin/pethotels/accommodations/dialog/create-edit-accommodations.component';
import { AccomodationListDto } from 'app/modules/admin/pethotels/accommodations/models/accomodationListDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';

@Component({
  selector: 'app-patient-accommodation-tab',
  templateUrl: './patient-accommodation-tab.component.html',
  styleUrls: ['./patient-accommodation-tab.component.css']
})
export class PatientAccommodationTabComponent implements OnInit {
  displayedColumns: string[] = ['customerName', 'roomName', 'checkinDate', 'checkOutDate', 'actions'];
  recievedCustomerId:string;
  isUpdateButtonActive: boolean;
  @ViewChild('paginator') paginator: MatPaginator;
  accommodations: AccomodationListDto[] = [];
  dataSource = new MatTableDataSource<AccomodationListDto>(this.accommodations);

  constructor(
    private _dialog: MatDialog,
    private _accommodationrooms: AccommodationsService,
    private _translocoService: TranslocoService,
    private _customerDataService: CustomerDataService
  ) { }

  ngOnInit() {
    this.recievedCustomerId=this._customerDataService.getCustomerId();
    this.getAccommodationsList();
  }

  getAccommodationsList() {

    const model = {
      CustomerId: this.recievedCustomerId
    }

    this._accommodationrooms.getAccomodationList(model).subscribe((response) => {
      this.accommodations = response.data;
      this.dataSource = new MatTableDataSource<AccomodationListDto>(
        this.accommodations
      );
      this.dataSource.paginator = this.paginator;
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
          this._accommodationrooms
            .deleteAccomodation(model)
            .subscribe((response) => {
              if (response.isSuccessful) {
                this.getAccommodationsList();
                const sweetAlertDto2 = new SweetAlertDto(
                  this.translate('sweetalert.success'),
                  this.translate('sweetalert.transactionSuccessful'),
                  SweetalertType.success
                );
                GeneralService.sweetAlert(sweetAlertDto2);
              } else {
                this.showSweetAlert('error', response.errors[0]);
                console.log(response.errors[0]);
              }
            });
        }
      }
    );
  };

  public updateAccomodation = (id: string) => {
    this.isUpdateButtonActive = true;
    const selectedroom = this.accommodations.find((x) => x.id === id);
    if (selectedroom) {
      const dialogRef = this._dialog.open(
        CreateEditAccommodationsComponent,
        {
          maxWidth: '100vw !important',
          disableClose: true,
          data: selectedroom
        }
      );
      dialogRef.afterClosed().subscribe((response) => {
        if (response.status) {
          this.getAccommodationsList();
        }
      });
    }
  };

  public reservationlogout = (id: string) => {

    const selectedroom = this.accommodations.find((x) => x.id === id);
    if (selectedroom) {

      this.isUpdateButtonActive = false;
      const dialog = this._dialog
        .open(AccommodationexitComponent, {
          maxWidth: '100vw !important',
          disableClose: true,
          data: selectedroom,
        })
        .afterClosed()
        .subscribe((response) => {
          if (response.status) {
            this.getAccommodationsList();
          }
        });

    }

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
