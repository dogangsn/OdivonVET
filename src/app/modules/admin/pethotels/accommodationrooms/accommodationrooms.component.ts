import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { RoomListDto } from './models/roomListDto';
import { MatTableDataSource } from '@angular/material/table';
import { CreateEditAccommodationRoomsDialogComponent } from './dialog/create-edit-accommodationroom';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { AccommodationsRoonService } from 'app/core/services/pethotels/accommodationrooms/accommodationsroom.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';

@Component({
  selector: 'app-accommodationrooms',
  templateUrl: './accommodationrooms.component.html',
  styleUrls: ['./accommodationrooms.component.scss']
})
export class AccommodationroomsComponent implements OnInit {

  displayedColumns: string[] = ['roomName', 'price', 'actions'];

  isUpdateButtonActive: boolean;
  @ViewChild('paginator') paginator: MatPaginator;
  rooms: RoomListDto[] = [];
  dataSource = new MatTableDataSource<RoomListDto>(this.rooms);
  items = Array(13);
  loader = true;

  constructor(
    private _dialog: MatDialog,
    private _accommodationrooms: AccommodationsRoonService,
    private _translocoService: TranslocoService,) { }

  ngOnInit() {
    this.getRoomList();
  }

  getRoomList() {
    this._accommodationrooms.getRoomList().subscribe((response) => {
      this.rooms = response.data;
      this.dataSource = new MatTableDataSource<RoomListDto>(
        this.rooms
      ); 
      this.dataSource.paginator = this.paginator;
      setTimeout(() => {
          if (this.dataSource) {
              this.dataSource.paginator = this.paginator;
          }
      }, 0);
      this.loader = false;
    });
  }

  addPanelOpen(): void {
    this.isUpdateButtonActive = false;
    const dialog = this._dialog
      .open(CreateEditAccommodationRoomsDialogComponent, {
        maxWidth: '100vw !important',
        disableClose: true,
        data: null,
      })
      .afterClosed()
      .subscribe((response) => {
        if (response.status) {
          this.getRoomList();
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
            .deleteRoom(model)
            .subscribe((response) => {
              if (response.isSuccessful) {
                this.getRoomList();
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
    const selectedroom = this.rooms.find((x) => x.id === id);
    if (selectedroom) {
      const dialogRef = this._dialog.open(
        CreateEditAccommodationRoomsDialogComponent,
        {
          maxWidth: '100vw !important',
          disableClose: true,
          data: selectedroom
        }
      );
      dialogRef.afterClosed().subscribe((response) => {
        if (response.status) {
          this.getRoomList();
        }
      });
    }
  };
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


}
