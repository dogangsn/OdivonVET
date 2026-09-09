import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { PaymentMethodservice } from 'app/core/services/definition/paymentmethods/paymentmethods.service';
import { GeneralService } from 'app/core/services/general/general.service';
import { PaymentMethodsDto } from 'app/modules/admin/definition/paymentmethods/models/PaymentMethodsDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'DDD MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'DDD MMMM YYYY',
  },
};


@Component({
  selector: 'app-balacecollection',
  templateUrl: './balacecollection.component.html',
  styleUrls: ['./balacecollection.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    {
      provide: MAT_DATE_FORMATS, useValue: MY_FORMATS
    },
  ],
})
export class BalacecollectionComponent implements OnInit {

  selectedbalancecollection: any;
  buttonDisabled = false;
  selectedCustomerId;

  customers = []; //{ name: 'Barış Alper YILMAZ', balance: 240.00 }
  selectedCustomer;
  paymentMethods = ['Nakit'];
  paymentMethod;
  collectionAmount = 0;
  collectionDate = new Date().toISOString().split('T')[0];
  payments: PaymentMethodsDto[] = [];

  formGroup: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    private _dialogRef: MatDialogRef<any>,
    private _translocoService: TranslocoService,
    private _customerService: CustomerService,
    private _paymentmethodsService: PaymentMethodservice,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.customers = data.customerlist;
    this.selectedCustomerId = data.customerId
    this.selectedCustomer = this.customers[0];

  }

  ngOnInit() {
    this.paymentsList();

    this.formGroup = this._formBuilder.group({
      customer: [this.customers[0]],
      paymenttype: [1, Validators.required],
      date: new FormControl(new Date()),
      remark: [''],
      amount: [0],
    });

  }

  addCollection() {

    const model = {
      customerId: this.selectedCustomerId,
      paymentId: this.getFormValueByName('paymenttype'),
      date: this.getFormValueByName('date'),
      amount: this.getFormValueByName('amount'),
      remark: this.getFormValueByName('remark')
    };
    if (model.amount <= 0) {
      this.showSweetAlert('error', 'Tahsilat Tutatarı Giriniz...');
      this.buttonDisabled = false;
      return;
    }

    this._customerService
      .balanceCollection(model)
      .subscribe(
        (response) => {
          if (response.isSuccessful) {
            this.showSweetAlert(
              'success',
              'sweetalert.transactionSuccessful'
            );
            this._dialogRef.close({
              status: true,
            });
          } else {
            this.showSweetAlert(
              'error',
              'sweetalert.transactionFailed'
            );
          }
        },
        (err) => {
          console.log(err);
        }
      );

  }

  viewCustomerCard() {
    console.log('Müşteri kartı görüntüleniyor:', this.selectedCustomer);
  }

  addOrUpdateCollection(): void {
    this.buttonDisabled = true;
    this.selectedbalancecollection ? this.updateCollection() : this.addCollection();
  }

  updateCollection(): void {

  }

  getFormValueByName(formName: string): any {
    return this.formGroup.get(formName).value;
  }

  paymentsList() {
    this._paymentmethodsService
      .getPaymentMethodsList()
      .subscribe((response) => {
        this.payments = response.data;
        console.log(this.payments);
      });
  }

  closeDialog(): void {
    this._dialogRef.close({ status: null });
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

  handleClick() {
    this.formGroup.get('amount').setValue(this.selectedCustomer.balance);
  }

}
