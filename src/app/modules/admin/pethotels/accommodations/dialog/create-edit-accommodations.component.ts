import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { AccommodationsRoonService } from 'app/core/services/pethotels/accommodationrooms/accommodationsroom.service';
import { PatientDetails } from 'app/modules/admin/customer/models/PatientDetailsCommand';
import { customersListDto } from 'app/modules/admin/customer/models/customersListDto';
import { RoomListDto } from '../../accommodationrooms/models/roomListDto';
import { AccomodationType, CreateAccomodationCommand } from '../models/createAccomodationCommand';
import { AccommodationsService } from 'app/core/services/pethotels/accommodations/accommodation.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { EditorStyle, LabelMode } from 'devextreme/common';
import { Observable, Subject, takeUntil, zip } from 'rxjs';
import { UpdateAccomodationCommand } from '../models/updateAccomodationCommand';
import { ParametersService } from 'app/core/services/settings/parameters.service';
import { parametersListDto } from 'app/modules/admin/settings/parameters/models/parametersListDto';

@Component({
  selector: 'app-create-edit-accommodations',
  templateUrl: './create-edit-accommodations.component.html',
  styleUrls: ['./create-edit-accommodations.component.css']
})


export class CreateEditAccommodationsComponent implements OnInit {

  stylingMode: EditorStyle = 'outlined';
  labelMode: LabelMode = 'static';
  selectedaccommodation: any;
  buttonDisabled = false;
  accommodation: FormGroup;

  patientList: PatientDetails[] = [];
  customers: customersListDto[] = [];
  rooms: RoomListDto[] = [];

  now: Date = new Date();
  selectedCheckinDate: Date = new Date();
  selectedCheckOutDate: Date = new Date();

  msInDay = 1000 * 60 * 60 * 24;
  currentValue: [Date, Date] = [
    new Date(this.now.getTime() - this.msInDay * 3),
    new Date(this.now.getTime() + this.msInDay * 3),
  ];

  // states: string[] = ['Pansiyon', 'Hospitalizasyon'];

  selectedtabItem: number = 0;
  destroy$: Subject<boolean> = new Subject<boolean>();
  parameters: parametersListDto[] = [];
  isDateFormat: number;

  states: { key: number, value: string }[] = [
    { key: AccomodationType.Hostel, value: 'Pansiyon' },
    { key: AccomodationType.Hospitalization, value: 'Hospitalizasyon' }
  ];

  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    private _translocoService: TranslocoService,
    private _accommodationrooms: AccommodationsRoonService,
    private _customerService: CustomerService,
    private _accomodations: AccommodationsService,
    private _parameterService: ParametersService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectedaccommodation = data;
  }

  ngOnInit() {

    zip(
      this.getCustomerList(),
      this.getRoomList(),
      this.asyncgetParameter()

    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (value) => {
        this.setCustomerList(value[0]),
          this.setRoomList(value[1]),
          this.setasyncgetParameter(value[2])
      },
      error: (e) => {
        console.log(e);
      },
      complete: () => {
        this.fillFormData(this.selectedaccommodation);
        if (this.parameters) {
          this.isDateFormat = this.parameters[0].petHotelsDateTimeFormat;
        }

      }
    });


    this.accommodation = this._formBuilder.group({
      customerId: [''],
      patientId: [''],
      roomId: [''],
      selectedState: [1],
      remark: ['']
    });

  }

  getCustomerList(): Observable<any> {
    let model = {
      IsArchive : false
  }
    return this._customerService.getcustomerlist(model);
  }

  setCustomerList(response: any): void {
    if (response.data) {
      this.customers = response.data;
    }
  }

  getRoomList(): Observable<any> {
    return this._accommodationrooms.getRoomList();
  }

  setRoomList(response: any): void {
    if (response.data) {
      this.rooms = response.data;
    }
  }

  asyncgetParameter(): Observable<any> {
    return this._parameterService.getparameterList()
  }

  setasyncgetParameter(response: any): void {
    if (response.data) {
      this.parameters = response.data;
    }
  }


  fillFormData(selectedAccomodation: any) {

    if (this.selectedaccommodation !== null) {

      this.accommodation.setValue({
        customerId: selectedAccomodation.customerId,
        patientId: selectedAccomodation.patientsId,
        roomId: selectedAccomodation.roomId,
        selectedState: selectedAccomodation.accomodation,
        remark: selectedAccomodation.remark
      });
      this.selectedCheckinDate = selectedAccomodation.checkinDate;
      this.selectedCheckOutDate = selectedAccomodation.checkoutDate;

      this.handleCustomerChange({ value: selectedAccomodation.customerId });
    }
  }


  handleCustomerChange(event: any) {
    const model = {
      id: event.value,
    };
    if (model.id == undefined) {
      model.id = event;
    }

    this._customerService
      .getPatientsByCustomerId(model)
      .subscribe((response) => {
        this.patientList = response.data;
        if (this.patientList.length === 1) {
          // this.examinationForm
          //   .get('patientId')
          //   .patchValue(this.patientList[0].recId);
        }
      });
  }

  closeDialog(): void {
    this._dialogRef.close({ status: null });
  }

  onTabChange(event: any) {
    this.selectedtabItem = event;
    if (event === 1) {

    }
  }

  handleValueChange(e) {
    this.selectedCheckinDate = e.value;
  }

  handleValueCheckOutChange(e) {
    this.selectedCheckOutDate = e.value;
  }

  addOrUpdateAccommodation(): void {

    this.buttonDisabled = true;
    this.selectedaccommodation
      ? this.updateaAccomodation()
      : this.addAccomodation();

  }

  getFormValueByName(formName: string): any {
    return this.accommodation.get(formName).value;
  }

  addAccomodation(): void {

    if (this.isDateFormat == 0) {
      const updatedDateCheckinDate = new Date(this.selectedCheckinDate);
      updatedDateCheckinDate.setHours(0, 0, 0, 0);
      this.selectedCheckinDate = updatedDateCheckinDate;

      const updatedDateCheckoutDate = new Date(this.selectedCheckOutDate);
      updatedDateCheckoutDate.setHours(0, 0, 0, 0);
      this.selectedCheckOutDate = updatedDateCheckoutDate;
    }



    const item = new CreateAccomodationCommand(
      this.selectedtabItem,
      this.getFormValueByName('roomId'),
      this.selectedCheckinDate,
      this.selectedCheckOutDate,
      (this.getFormValueByName('selectedState')),
      this.getFormValueByName('remark'),
      this.getFormValueByName('customerId') === undefined || this.getFormValueByName('customerId') === null || this.getFormValueByName('customerId') === '' ? '00000000-0000-0000-0000-000000000000' : this.getFormValueByName('customerId'),
      this.getFormValueByName('patientId') === undefined || this.getFormValueByName('patientId') === null || this.getFormValueByName('patientId') === '' ? '00000000-0000-0000-0000-000000000000' : this.getFormValueByName('patientId'),
    );

    this._accomodations.createAccommodation(item).subscribe(
      (response) => {
        if (response.isSuccessful) {
          this.showSweetAlert('success', 'sweetalert.transactionSuccessful');
          this._dialogRef.close({
            status: true,
          });
        } else {
          this.buttonDisabled = false;
          this.showSweetAlert('error', response.errors);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  updateaAccomodation(): void {

    if (this.isDateFormat == 0) {
      const updatedDateCheckinDate = new Date(this.selectedCheckinDate);
      updatedDateCheckinDate.setHours(0, 0, 0, 0);
      this.selectedCheckinDate = updatedDateCheckinDate;

      const updatedDateCheckoutDate = new Date(this.selectedCheckOutDate);
      updatedDateCheckoutDate.setHours(0, 0, 0, 0);
      this.selectedCheckOutDate = updatedDateCheckoutDate;
    }


    const item = new UpdateAccomodationCommand(
      this.selectedaccommodation.id,
      this.selectedtabItem,
      this.getFormValueByName('roomId'),
      this.selectedCheckinDate,
      this.selectedCheckOutDate,
      (this.getFormValueByName('selectedState')),
      this.getFormValueByName('remark'),
      this.getFormValueByName('customerId') === undefined || this.getFormValueByName('customerId') === null || this.getFormValueByName('customerId') === '' ? '00000000-0000-0000-0000-000000000000' : this.getFormValueByName('customerId'),
      this.getFormValueByName('patientId') === undefined || this.getFormValueByName('patientId') === null || this.getFormValueByName('patientId') === '' ? '00000000-0000-0000-0000-000000000000' : this.getFormValueByName('patientId'),
    );

    this._accomodations.updateAccommodation(item).subscribe(
      (response) => {
        if (response.isSuccessful) {
          this.showSweetAlert('success', 'sweetalert.transactionSuccessful');
          this._dialogRef.close({
            status: true,
          });
        } else {
          this.buttonDisabled = false;
          this.showSweetAlert('error', response.errors);
        }
      },
      (err) => {
        console.log(err);
      }
    );

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
        message,
        SweetalertType.error
      );
      GeneralService.sweetAlert(sweetAlertDto);
    }
  }

  translate(key: string): any {
    return this._translocoService.translate(key);
  }

  isGuestTabEnabled(): boolean {
    const customerId = this.accommodation.get('customerId')?.value;
    const _customer = customerId === '00000000-0000-0000-0000-000000000000' ? true : false;
    return this.selectedaccommodation && _customer;
  }

  currentValueChanged({ value: [startDate, endDate] }) {
    this.selectedCheckinDate = startDate;
    this.selectedCheckOutDate = endDate;
  }


}
