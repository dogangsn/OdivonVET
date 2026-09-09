import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { AccomodationListDto } from './models/accomodationListDto';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { AccommodationsService } from 'app/core/services/pethotels/accommodations/accommodation.service';
import { TranslocoService } from '@ngneat/transloco';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { CreateEditAccommodationsComponent } from './dialog/create-edit-accommodations.component';
import { AccommodationexitComponent } from './dialog/accommodationexit/accommodationexit.component';

@Component({
  selector: 'app-accommodations',
  templateUrl: './accommodations.component.html',
  styleUrls: ['./accommodations.component.scss']
})
export class AccommodationsComponent implements OnInit {

  displayedColumns: string[] = ['warning', 'customerName', 'roomName', 'checkinDate', 'checkOutDate', 'actions'];

  isUpdateButtonActive: boolean;
  @ViewChild('paginator') paginator: MatPaginator;
  accommodations: AccomodationListDto[] = [];
  dataSource = new MatTableDataSource<AccomodationListDto>(this.accommodations);
  now: Date = new Date();
  loader = true;
  items = Array(13);

  constructor(
    private _dialog: MatDialog,
    private _accommodationrooms: AccommodationsService,
    private _translocoService: TranslocoService) { }

  ngOnInit() {
    this.getAccommodationsList();
  }

  getAccommodationsList() {

    const model = {
      CustomerId: '00000000-0000-0000-0000-000000000000'
    }

    this._accommodationrooms.getAccomodationList(model).subscribe((response) => {
      this.accommodations = response.data;
      this.dataSource = new MatTableDataSource<AccomodationListDto>(
        this.accommodations
      );
      this.dataSource.paginator = this.paginator;
      setTimeout(() => {
          if (this.dataSource) {
              this.dataSource.paginator = this.paginator;
          }
      }, 0);
      this.loader = false;
      console.log(this.now);
    });
  }

  addPanelOpen(): void {
    this.isUpdateButtonActive = false;
    const dialog = this._dialog
      .open(CreateEditAccommodationsComponent, {
        maxWidth: '100vw !important',
        disableClose: true,
        data: null,
      })
      .afterClosed()
      .subscribe((response) => {
        if (response.status) {
          this.getAccommodationsList();
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

  public redirectToUpdate = (id: string) => {
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



  stringFormatDate(date: string): Date {
    return new Date(date);
  }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
  

}
