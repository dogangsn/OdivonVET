import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { AccommodationsRoonService } from 'app/core/services/pethotels/accommodationrooms/accommodationsroom.service';
import { AccommodationsService } from 'app/core/services/pethotels/accommodations/accommodation.service';
import { PatientDetails } from 'app/modules/admin/customer/models/PatientDetailsCommand';
import { customersListDto } from 'app/modules/admin/customer/models/customersListDto';
import { RoomListDto } from '../../../accommodationrooms/models/roomListDto';
import { Observable, Subject, takeUntil, zip } from 'rxjs';
import { PaymentMethodsDto } from 'app/modules/admin/definition/paymentmethods/models/PaymentMethodsDto';
import { PaymentMethodservice } from 'app/core/services/definition/paymentmethods/paymentmethods.service';
import { PatientListService } from 'app/core/services/patient/patientList/patientList.service';
import { PatientOwnerListDto } from 'app/modules/admin/patient/patientlist/models/patientOwnerListDto';
import { CreateAccommodationExit } from '../../models/createAccommodationExit';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';

@Component({
  selector: 'app-accommodationexit',
  templateUrl: './accommodationexit.component.html',
  styleUrls: ['./accommodationexit.component.css']
})
export class AccommodationexitComponent implements OnInit {

  selectedaccomodationexit: any;
  buttonDisabled = false;
  accommodationexit: FormGroup;
  patientListAll: PatientOwnerListDto[] = [];
  patientList: PatientDetails[] = [];
  customers: customersListDto[] = [];
  rooms: RoomListDto[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  now: Date = new Date();
  selectedCheckinDate: Date = new Date();
  selectedCheckOutDate: Date = new Date();
  payments: PaymentMethodsDto[] = [];

  price: number = 0;
  priceType: number;
  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    private _translocoService: TranslocoService,
    private _accommodationrooms: AccommodationsRoonService,
    private _customerService: CustomerService,
    private _accomodations: AccommodationsService,
    private _paymentmethodsService: PaymentMethodservice,
    private _patientService: PatientListService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectedaccomodationexit = data;
    if (this.selectedaccomodationexit !== null) {
      this.price = this.selectedaccomodationexit.price;
      this.priceType = this.selectedaccomodationexit.priceType
    }
  }

  ngOnInit() {

    zip(
      this.getCustomerList(),
      this.getRoomList(),
      this.paymentsList(),
      this.getPatientList()
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (value) => {
        this.setCustomerList(value[0]),
          this.setRoomList(value[1]),
          this.setpaymentList(value[2]),
          this.setPatientList(value[3])
      },
      error: (e) => {
        console.log(e);
      },
      complete: () => {
        this.fillFormData(this.selectedaccomodationexit);
      }
    });


    this.accommodationexit = this._formBuilder.group({
      customerId: [{ value: '', disabled: true }],
      patientId: [{ value: '', disabled: true }],
      roomId: [{ value: '', disabled: true }],
      checkinDate: [{ value: '', disabled: true }],
      checkoutDate: [{ value: '' }],
      paymenttype: [1],
      price: 0,
      pricecollection: 0
    });
  }

  fillFormData(selectedAccomodation: any) {

    if (this.selectedaccomodationexit !== null) {
      this.accommodationexit.setValue({
        customerId: selectedAccomodation.customerId,
        patientId: selectedAccomodation.patientsId,
        roomId: selectedAccomodation.roomId,
        checkinDate: selectedAccomodation.checkinDate,
        checkoutDate: selectedAccomodation.checkoutDate,
        paymenttype: 1,
        price: this.price,
        pricecollection: 0
      });
    }
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

  getRoomList() {
    return this._accommodationrooms.getRoomList();
  }

  setRoomList(response: any): void {
    if (response.data) {
      this.rooms = response.data;
    }
  }

  closeDialog(): void {
    this._dialogRef.close({ status: null });
  }

  addOrUpdateAccommodationExit(): void {
    this.buttonDisabled = true;
    this.addAccommodationExit();
  }

  addAccommodationExit(): void {
    const item = new CreateAccommodationExit(
      this.selectedaccomodationexit.id,
      this.getFormValueByName('customerId'),
      this.getFormValueByName('patientId'),
      this.getFormValueByName('roomId'),
      this.selectedCheckinDate,
      this.selectedCheckOutDate,
      this.getFormValueByName('price'),
      this.getFormValueByName('pricecollection'),
      this.getFormValueByName('paymenttype'),
    )
    this._accomodations.updateCheckOut(item).subscribe(
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

  getFormValueByName(formName: string): any {
    return this.accommodationexit.get(formName).value;
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
        }
      });
  }

  handleValueChange(e) {
    this.selectedCheckinDate = e.value;
  }

  handleValueCheckOutChange(e) {
    this.selectedCheckOutDate = e.value;
  }

  paymentsList(): Observable<any> {
    return this._paymentmethodsService.getPaymentMethodsList();

  }

  setpaymentList(response: any): void {
    if (response.data) {
      this.payments = response.data;
    }
  }

  getPatientList(): Observable<any> {
    return this._patientService.gtPatientList();
  }

  setPatientList(response: any): void {
    if (response.data) {
      this.patientListAll = response.data;
    }
  }

  calculateAccom(): void {

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

}

export enum PriceTypes {
  Daily = 0,
  Hours = 1
}