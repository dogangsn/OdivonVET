import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { SmsTemplateService } from 'app/core/services/definition/SmsTemplate/smstemplate.service';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { CreateSmsTemplateCommand } from '../models/createSmsTemplateCommand';
import { SmsTemplateListDto } from '../models/smstemplatelistDto';
import { UpdateSmsTemplateCommand } from '../models/updateSmsTemplateCommand';
import { PrintType, PrintTypeDisplay } from '../../printtemplate/models/printType.enum';
import { SmsType, SmsTypeDisplay } from '../models/smsType.enum';


@Component({
  selector: 'app-createedit-smstemplate',
  templateUrl: './createedit-smstemplate.component.html',
  styleUrls: ['./createedit-smstemplate.component.css']
})
export class CreateeditSmstemplateComponent implements OnInit {

  @ViewChild('textareaElement') textareaElement: ElementRef<HTMLTextAreaElement>;
  selectedsmstemplate: SmsTemplateListDto;
  smstemplate: FormGroup;
  selectedOption: number = 1;
  buttonDisabled = false;

  printTypes = Object.values(SmsType).filter(value => typeof value === 'number') as SmsType[];

  availableOptions = [];

  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    private _translocoService: TranslocoService,
    private _smstemplateService: SmsTemplateService,
    @Inject(MAT_DIALOG_DATA) public data: SmsTemplateListDto
  ) {
    this.selectedsmstemplate = data;
  }

  ngOnInit() {
    this.smstemplate = this._formBuilder.group({
      active: [true],
      templatename: [''],
      smstype : ['', Validators.required],
      enableSMS: false,
      enableAppNotification: false,
      enableEmail: false,
      enableWhatsapp: false,
      templatecontent: ['', Validators.required]
    })
    this.fillFormData(this.selectedsmstemplate);
  }

  toggleSelection(option: any) {
    // option.selected = !option.selected;
    // const selectedOptions = this.availableOptions.filter(opt => opt.selected).map(opt => opt.value);
    // this.smstemplate.controls['templatecontent'].setValue(selectedOptions.join(', ')); // Seçili seçeneklerin değerlerini textarea içine yazıyoruz
    const textarea = this.textareaElement.nativeElement;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPosition);
    const textAfterCursor = textarea.value.substring(cursorPosition);

    const newText = textBeforeCursor + option.value + textAfterCursor;
    this.smstemplate.controls['templatecontent'].setValue(newText);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = cursorPosition + option.value.length;
    }, 0);

  }

  closeDialog(): void {
    this._dialogRef.close({ status: null });
  }

  addOrUpdateSmsTemplate(): void {
    this.buttonDisabled = true;
    this.selectedsmstemplate
      ? this.updateSmsTemplate()
      : this.addSmsTemplate();
  }

  addSmsTemplate(): void {

    const model = new CreateSmsTemplateCommand(
      this.getFormValueByName('active'),
      this.getFormValueByName('templatename'),
      this.getFormValueByName('templatecontent'),
      this.getFormValueByName('smstype'),
      this.getFormValueByName('enableSMS'),
      this.getFormValueByName('enableAppNotification'),
      this.getFormValueByName('enableEmail'),
      this.getFormValueByName('enableWhatsapp'),
    );

    this._smstemplateService
      .createSmsTemplate(model)
      .subscribe(
        (response) => { 
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

  updateSmsTemplate(): void {
    const model = new UpdateSmsTemplateCommand(
      this.selectedsmstemplate.id,
      this.getFormValueByName('active'),
      this.getFormValueByName('templatename'),
      this.getFormValueByName('templatecontent'),
      this.getFormValueByName('smstype'),
      this.getFormValueByName('enableSMS'),
      this.getFormValueByName('enableAppNotification'),
      this.getFormValueByName('enableEmail'),
      this.getFormValueByName('enableWhatsapp'),
    );

    this._smstemplateService
      .updateSmsTemplate(model)
      .subscribe(
        (response) => { 
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

  getFormValueByName(formName: string): any {
    return this.smstemplate.get(formName).value;
  }

  fillFormData(selectedsmstempla: SmsTemplateListDto) {

    if (this.selectedsmstemplate !== null) {
      this.smstemplate.setValue({
        active: selectedsmstempla.active,
        templatename: selectedsmstempla.templateName,
        enableSMS : selectedsmstempla.enableSMS,
        enableAppNotification : selectedsmstempla.enableAppNotification,
        enableEmail : selectedsmstempla.enableEmail,
        enableWhatsapp : selectedsmstempla.enableWhatsapp,
        templatecontent: selectedsmstempla.templateContent,
        smstype: selectedsmstempla.smsType
      });
    }
  }

  getPrintTypeDisplay(type: SmsType): string {
    return SmsTypeDisplay[type];
  }

  updateAvailableOptions(selectedPrintType: SmsType): void {
    switch (selectedPrintType) {
      case SmsType.AppointmentReminder:
        this.availableOptions = [
          { name: 'Müşteri Adı Soyadı / Hasta Adı', selected: false, value: '[[customername]]' },
          { name: 'Tarih', selected: false, value: '[[date]]' },  
        ];
        break;
      case SmsType.PaymentReminder:
        this.availableOptions = [
          { name: 'Müşteri Adı', selected: false, value: '[[customername]]' },
          { name: 'Müşteri Soyadı', selected: false, value: '[[customerlast]]' },
          { name: 'Toplam Borç', selected: false, value: '[[totalbalance]]' },
        ];
        break;

         
      default:
        this.availableOptions = [];
        break;
    }
  }

}
