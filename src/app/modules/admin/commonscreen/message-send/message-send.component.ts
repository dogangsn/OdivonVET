import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { GeneralService } from 'app/core/services/general/general.service';
import { ParametersService } from 'app/core/services/settings/parameters.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { Observable, Subject, takeUntil, zip } from 'rxjs';
import { SmsParametersDto } from '../../settings/smsparameters/models/smsParameterDto';
import { SmsTemplateService } from 'app/core/services/definition/SmsTemplate/smstemplate.service';
import { SmsType } from '../../definition/smstemplate/models/smsType.enum';
import { SmsTemplateListDto } from '../../definition/smstemplate/models/smstemplatelistDto';
import { MessageService } from 'app/core/services/message/message.service';

enum MessageType {
  Sms = 1,
  Whatsapp = 2,
  Mail = 3,
  MobileApp = 4
}

@Component({
  selector: 'app-message-send',
  templateUrl: './message-send.component.html',
  styleUrls: ['./message-send.component.css']
})
export class MessageSendComponent implements OnInit {

  sendmessage: FormGroup;
  destroy$: Subject<boolean> = new Subject<boolean>();
  smsparameters: SmsParametersDto[] = []

  messageType: SmsType;
  templatelist: SmsTemplateListDto[] = [];
  isFixMessage: boolean;
  message: string;
  customerId: string;

  customername: string;
  patientname: string;
  date: string;
  amount: number;

  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    private _translocoService: TranslocoService,
    private _parametersService: ParametersService,
    private _smstemplateService: SmsTemplateService,
    private _messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.messageType = data.messageType;
    this.customerId = data.customerId;
    this.isFixMessage = data.isFixMessage;
    if (data.message) {
      this.message = data.message;
    }
    if (data.customername) {
      this.customername = data.customername;
    }
    if (data.date) {
      this.date = data.date;
    }
    if(data.amount){
      this.amount = data.amount;
    }


  }

  ngOnInit() {

    this.sendmessage = this._formBuilder.group({
      enableSMS: false,
      enableAppNotification: false,
      enableEmail: false,
      enableWhatsapp: false,
      templatecontent: [{ value: '', disabled: true }, Validators.required]
    })

    zip(
      this.getSmsParametersList(),
      this.getSmsTemplate(this.messageType)
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (value) => {
        this.setProducesResponse(value[0]),
          this.setTemplate(value[1])
      },
      error: (e) => {
        console.log(e);
      },
      complete: () => {
        if (this.smsparameters.length > 0) {
          this.sendmessage.get('enableSMS')?.setValue(true);
        }
        if (this.isFixMessage && this.message.length > 0) {
          this.sendmessage.get('templatecontent')?.setValue(this.message);
        }
      }
    });

  }

  closeDialog(): void {
    this._dialogRef.close({ status: null });
  }

  translate(key: string): any {
    return this._translocoService.translate(key);
  }

  sendMessage(): void {

    if (this.sendmessage.invalid) {
      this.showSweetAlert('error', 'Zorunlu Alanları Doldurunuz.');
      return;
    }

    const templatemessage = this.getFormValueByName('templatecontent');
    if(templatemessage.length == 0){
      this.showSweetAlert('error', 'Şablon Seçimi Yapınız.');
      return;
    }


    const sweetAlertDto = new SweetAlertDto(
      "Mesaj Gönderilecektir",
      this.translate('sweetalert.areYouSure'),
      SweetalertType.warning
    );
    GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
      (swalResponse) => {
        if (swalResponse.isConfirmed) {

          const selectedTypes: MessageType[] = [];
          const formValue = this.sendmessage.value;

          if (formValue.enableSMS) {
            selectedTypes.push(MessageType.Sms);
          }
          if (formValue.enableAppNotification) {
            selectedTypes.push(MessageType.MobileApp);
          }
          if (formValue.enableEmail) {
            selectedTypes.push(MessageType.Mail);
          }
          if (formValue.enableWhatsapp) {
            selectedTypes.push(MessageType.Whatsapp);
          }

          if (selectedTypes.length === 0) {
            alert('Lütfen en az bir bildirim seçeneği seçiniz.');
          } else if (this.sendmessage.invalid) {
            alert('Lütfen gerekli tüm alanları doldurun.');
          } else {

            var model = {
              type: selectedTypes,
              content: this.getFormValueByName('templatecontent'),
              customerId: this.customerId
            }
            this._messageService
              .multiAutoSendMessage(model)
              .subscribe((response) => {
                if (response.isSuccessful) {
                  const sweetAlertDto2 = new SweetAlertDto(
                    this.translate('sweetalert.success'),
                    this.translate('sweetalert.transactionSuccessful'),
                    SweetalertType.success
                  );
                  GeneralService.sweetAlert(sweetAlertDto2);
                  this._dialogRef.close({
                    status: true,
                  });
                } else {
                  console.error('işlem başarısız.');
                }
              });
          }

        }
      });

  }

  getSmsParametersList(): Observable<any> {
    return this._parametersService.getSmsParametersList();
  }

  setProducesResponse(response: any): void {
    this.smsparameters = response.data;
  }

  getSmsTemplate(type): Observable<any> {
    var model = {
      type: type
    }
    return this._smstemplateService.getSmsTemplateIdBy(model);
  }

  setTemplate(response: any): void {
    this.templatelist = response.data;
  }

  getFormValueByName(formName: string): any {
    return this.sendmessage.get(formName).value;
  }


  handletemplate(event: any) {
    let messageTemplate;
    let item = this.templatelist.find(x => x.id == event.value);
    if (item) {
      messageTemplate = item.templateContent.toString();
      let _message;
      if (item.smsType == SmsType.AppointmentReminder) {
        _message = createReminderMessage(this.customername, this.date);
      }
      if (item.smsType == SmsType.PaymentReminder) {
        _message = createPaymentReminderMessage(this.customername, this.amount);
      }
      this.sendmessage.get('templatecontent')?.setValue(_message);
    }
    function createReminderMessage(customerName: string, date: string): string {
      return messageTemplate
        .replace('[[customername]]', customerName)
        .replace('[[date]]', date.toString());
    }
    function createPaymentReminderMessage(customerName: string, amount: number): string {
      return messageTemplate
        .replace('[[customername]]', customerName)
        .replace('[[totalbalance]]', amount.toString());
    }

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
 

}
