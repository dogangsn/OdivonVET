import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UnitsService } from 'app/core/services/definition/unitdefinition/units.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { TranslocoService } from '@ngneat/transloco';
import { RoomListDto } from '../models/roomListDto';
import { CreateRoomCommand } from '../models/createRoomCommand';
import { AccommodationsRoonService } from 'app/core/services/pethotels/accommodationrooms/accommodationsroom.service';
import { UpdateRoomCommand } from '../models/updateRoomCommand';

@Component({
    selector: 'app-create-edit-accommodationroom-dialog',
    styleUrls: ['./create-edit-accommodationroom.scss'],
    templateUrl: './create-edit-accommodationroom.html',
})
export class CreateEditAccommodationRoomsDialogComponent implements OnInit {

    selectedaccommodationrooms: RoomListDto;
    accommodationrooms: FormGroup;
    buttonDisabled = false;
    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _translocoService: TranslocoService,
        private _accommodationrooms: AccommodationsRoonService,
        @Inject(MAT_DIALOG_DATA) public data: RoomListDto
    ) {
        this.selectedaccommodationrooms = data;
    }

    ngOnInit(): void {
        this.accommodationrooms = this._formBuilder.group({
            roomName: [''],
            price: [0],
            pricingType: ["1"],
        });
        this.fillFormData(this.selectedaccommodationrooms);
    }

    fillFormData(selectedRooms: RoomListDto) {

        if (this.selectedaccommodationrooms !== null) {
            this.accommodationrooms.setValue({
                roomName: selectedRooms.roomName,
                price: selectedRooms.price,
                pricingType : selectedRooms.pricingType.toString()
            });
        }
    }

    addOrUpdateRooms(): void {
        this.buttonDisabled = true;
        this.selectedaccommodationrooms
            ? this.updateaccommodationrooms()
            : this.addaccommodationrooms();
    }

    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }

    addaccommodationrooms(): void {
        const item = new CreateRoomCommand( 
            this.getFormValueByName('roomName'),
            this.getFormValueByName('price'),
            parseInt(this.getFormValueByName('pricingType'))
        );
        this._accommodationrooms.createRoom(item).subscribe(
            (response) => {
                if (response.isSuccessful) {
                    this.showSweetAlert('success');
                    this._dialogRef.close({
                        status: true,
                    });
                } else {
                    this.showSweetAlert('error');
                    this.buttonDisabled = false;
                }
            },
            (err) => {
                console.log(err);
                this.buttonDisabled = false;
            }
        );
    }

    updateaccommodationrooms(): void {
        const item = new UpdateRoomCommand( 
            this.selectedaccommodationrooms.id,
            this.getFormValueByName('roomName'),
            this.getFormValueByName('price'),
            parseInt(this.getFormValueByName('pricingType'))
        );
        this._accommodationrooms.updateRoom(item).subscribe(
            (response) => {
                debugger;

                if (response.isSuccessful) {
                    this.showSweetAlert('success');
                    this._dialogRef.close({
                        status: true,
                    });
                } else {
                    this.showSweetAlert('error');
                }
            },
            (err) => {
                console.log(err);
            }
        );
    }

    getFormValueByName(formName: string): any {
        return this.accommodationrooms.get(formName).value;
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
 

}
