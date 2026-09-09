import { Component, ElementRef, Inject, Input, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { TranslocoService } from '@ngneat/transloco';
import { CustomerGroupListDto } from 'app/modules/admin/definition/customergroup/models/customerGroupListDto';
import { CustomerGroupService } from 'app/core/services/definition/customergroup/customergroup.service';
import { CustomerDetailDto } from '../../../models/CustomerDetailDto';
import { CityService } from 'app/core/services/assetsService/cityService.service';

@Component({
  selector: 'app-customer-detail-edit-dialog',
  templateUrl: './customer-detail-edit-dialog.component.html',
  styleUrls: ['./customer-detail-edit-dialog.component.css']
})
export class CustomerDetailEditDialogComponent implements OnInit {
  customerEditForm: FormGroup;
  updateCustomerDetailDto: CustomerDetailDto;

  customergroupList: CustomerGroupListDto[] = [];
  selectedValue: string;
  buttonDisabled: boolean = false;
  stylesheet = document.styleSheets[0];

  cities: any[] = [];
  district: any[] = [];

  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    private _customerService: CustomerService,
    private _translocoService: TranslocoService,
    private _customergroup: CustomerGroupService,
    private _cityService: CityService,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) {

    this.getCustomerGroupList();
    this.customerEditForm = this._formBuilder.group({
      email: ['', [Validators.email]],
      phonenumber: ['', [Validators.required]],
      phonenumber2: [''],
      province: [''],
      district: [''],
      taxoffice: [''],
      vkntcno: [''],
      note: [''],
      smsNotification: [''],
      emailNotification: [''],
      address: [''],
      customerdiscount: [''],
      customerGroup: [''],
      recordDate: ['']
    });
  }

  ngOnInit() {

    debugger;

    this._cityService.getCities().subscribe(data => {
      this.cities = data;
      this.district = this.cities.filter(x => x.name === this.data.customerDetailForm.city)[0].districts;
    });


    (this.stylesheet as CSSStyleSheet).insertRule('body.light, body .light { position: fixed;}', 0);
    this.customerEditForm.patchValue({
      firstname: this.data.customerDetailForm.firstname,
      lastname: this.data.customerDetailForm.lastname,
      email: this.data.customerDetailForm.email,
      phonenumber: this.data.customerDetailForm.phonenumber,
      phonenumber2: this.data.customerDetailForm.phoneNumber2,
      province: this.data.customerDetailForm.city,
      district: this.data.customerDetailForm.district,
      taxoffice: this.data.customerDetailForm.taxoffice,
      vkntcno: this.data.customerDetailForm.vkntcno,
      note: this.data.customerDetailForm.note,
      smsNotification: this.data.customerDetailForm.smsNotification,
      emailNotification: this.data.customerDetailForm.emailNotification,
      address: this.data.customerDetailForm.address,
      customerdiscount: this.data.customerDetailForm.customerdiscount,
      customerGroup: this.data.customerDetailForm.customerGroup,
      recordDate: this.data.customerDetailForm.recordDate,
      adress : this.data.customerDetailForm.adress
    });
    this.handleCityChange(this.data.customerDetailForm.province);

  }

  updateCustomerDetail(): void {
    this.buttonDisabled = true;

    if (this.customerEditForm.invalid) {
      this.buttonDisabled = false;
      this.showSweetAlert('error', 'Zorunlu Alanları Doldurunuz.');
      return;
    }
    console.log( this.customerEditForm.value);

    this.updateCustomerDetailDto = this.customerEditForm.value;
    this.updateCustomerDetailDto.id = this.data.customerId;
    this.updateCustomerDetailDto.firstname = this.data.firstname;
    this.updateCustomerDetailDto.lastname = this.data.lastname;
    this.updateCustomerDetailDto.taxoffice = this.data.taxoffice;
    this.updateCustomerDetailDto.longadress = this.customerEditForm.value.address;

    const model = {
      customerDetailsDto: this.updateCustomerDetailDto
    }

    if (!this.phoneNumberValidator(this.updateCustomerDetailDto.phonenumber)) {
      this.showSweetAlert(
        'error',
        'Telefon Numarası Alan Kodu Hatalı. Kontrol Ediniz.'
      );
      return;
    }

    this._customerService.updateCustomerById(model.customerDetailsDto).subscribe((response) => {
      if (response.isSuccessful) {
        console.log(response);
        this.showSweetAlert('success', 'sweetalert.transactionSuccessful');
        this._dialogRef.close({ status: true });
      } else {
        this.buttonDisabled = false;
        this.showSweetAlert('error', response.errors[0]);
      }
    });
    for (let index = 0; index < this.stylesheet.cssRules.length; index++) {
      if (this.stylesheet.cssRules[index].cssText === 'body.light, body .light { position: fixed; }') {
        (this.stylesheet as CSSStyleSheet).deleteRule(index);
      }
    }
  }

  getCustomerGroupList() {
    this._customergroup.getcustomerGroupList().subscribe((response) => {
      this.customergroupList = response.data;
    });
  }


  showSweetAlert(type: string, text: string): void {
    if (type === 'success') {
      const sweetAlertDto = new SweetAlertDto(
        this.translate('sweetalert.success'),
        this.translate(text),
        SweetalertType.success
      );
      GeneralService.sweetAlert(sweetAlertDto);
    } else {
      const sweetAlertDto = new SweetAlertDto(
        this.translate('sweetalert.error'),
        this.translate(text),
        SweetalertType.error
      );
      GeneralService.sweetAlert(sweetAlertDto);
    }
  }

  translate(key: string): any {
    return this._translocoService.translate(key);
  }

  closeDialog(): void {
    this._dialogRef.close({ status: null });
    for (let index = 0; index < this.stylesheet.cssRules.length; index++) {
      if (this.stylesheet.cssRules[index].cssText === 'body.light, body .light { position: fixed; }') {
        (this.stylesheet as CSSStyleSheet).deleteRule(index);
      }
    }
  }

  handleCityChange(event: any) {
    let city = this.cities.filter(x => x.name === event.value);
    if (city.length > 0) {
      this.district = city[0].districts;
    } else {
      this.district = [];
    }
  }

  phoneNumberValidator(phoneNumber: any): boolean {

    const phoneNumberPattern = /^\(\d{3}\) \d{3}-\d{4}$/; // İstenen telefon numarası formatı
    const validAreaCodes = [
      '(505)',
      '(506)',
      '(507)',
      '(551)',
      '(552)',
      '(553)',
      '(554)',
      '(555)',
      '(556)',
      '(557)',
      '(558)',
      '(559)',
      '(501)',
      '(502)',
      '(503)',
      '(504)',
      '(540)',
      '(541)',
      '(542)',
      '(543)',
      '(544)',
      '(545)',
      '(546)',
      '(547)',
      '(548)',
      '(549)',
      '(530)',
      '(531)',
      '(532)',
      '(533)',
      '(534)',
      '(535)',
      '(536)',
      '(537)',
      '(538)',
      '(539)',
      '(501)',
      '(502)',
      '(503)',
      '(504)',
      '(505)',
      '(506)',
      '(507)',
    ];

    // if (!phoneNumberPattern.test(phoneNumber)) {
    //     return { invalidPhoneNumber: { value: phoneNumber } };
    // }

    const inputAreaCode = phoneNumber.substring(0, 5); // Telefon numarasından alan kodunu al

    if (!validAreaCodes.includes(inputAreaCode)) {
      return false; // Geçersiz alan kodu hatası
    }
    return true;
  }

}
