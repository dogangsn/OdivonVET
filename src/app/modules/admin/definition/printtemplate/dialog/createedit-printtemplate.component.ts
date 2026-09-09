import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TinymceEditorService } from 'app/modules/bases/global/tinymce-editor.service';
import { PrintType, PrintTypeDisplay } from '../models/printType.enum';
import { Editor, EditorEvent, } from 'tinymce';
import { PrintTemplateService } from 'app/core/services/definition/printtemplate/printtemplate.service';
import { CreatePrintTemplateCommand } from '../models/createPrintTemplateCommand';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { TranslocoService } from '@ngneat/transloco';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { PrintTemplateListDto } from '../models/printtemplatelistdto';
import { UpdatePrintTemplateCommand } from '../models/updatePrintTemplateCommand';

@Component({
  selector: 'app-createedit-printtemplate',
  templateUrl: './createedit-printtemplate.component.html',
  styleUrls: ['./createedit-printtemplate.component.css']
})
export class CreateeditPrinttemplateComponent implements OnInit {

  @ViewChild('editor', { static: true }) editorElement!: ElementRef;

  selectedprinttemplate: PrintTemplateListDto;
  tinymceOptions: any;
  buttonDisabled = false;
  printtemplate: FormGroup;

  selectedPrintType: PrintType = PrintType.Customer;
  printTypes = Object.values(PrintType).filter(value => typeof value === 'number') as PrintType[];

  availableOptions: { name: string, selected: boolean, value: string }[] = [];

  htmlEditorValue: any;

  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _tinymceService: TinymceEditorService,
    private _formBuilder: FormBuilder,
    private _printtemplate: PrintTemplateService,
    private _translocoService: TranslocoService,
    @Inject(MAT_DIALOG_DATA) public data: PrintTemplateListDto
  ) {
    this.selectedprinttemplate = data;
  }

  ngOnInit() {
    this.tinymceOptions = this._tinymceService.getTinymceOptions();
    this.printtemplate = this._formBuilder.group({
      templatename: ['', Validators.required],
      printType: [0, Validators.required],
      templatecontent: ['']
    });


    this.fillFormData(this.selectedprinttemplate)
  }

  fillFormData(selectedPrint: PrintTemplateListDto) {

    if (this.selectedprinttemplate !== null) {
      this.printtemplate.setValue({
        templatename: selectedPrint.templateName,
        printType: selectedPrint.type,
        templatecontent: selectedPrint.htmlContent
      });
    }
  }

  addOrUpdatePrintTemplate(): void {
    this.buttonDisabled = true;
    this.selectedprinttemplate ? this.updatePrintTemplate() : this.addPrintTemplate();
  }

  addPrintTemplate(): void {
    const model = new CreatePrintTemplateCommand(
      this.getFormValueByName('templatename'),
      this.getFormValueByName('printType'),
      this.getFormValueByName('templatecontent'),
    );

    this._printtemplate
      .createPrintTemplate(model)
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

  updatePrintTemplate(): void {
    const model = new UpdatePrintTemplateCommand(
      this.selectedprinttemplate.id,
      this.getFormValueByName('templatename'),
      this.getFormValueByName('printType'),
      this.getFormValueByName('templatecontent'),
    );

    this._printtemplate
      .updatePrintTemplate(model)
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

  closeDialog(): void {
    this._dialogRef.close({ status: null });
  }

  getPrintTypeDisplay(type: PrintType): string {
    return PrintTypeDisplay[type];
  }

  getFormValueByName(formName: string): any {
    return this.printtemplate.get(formName).value;
  }

  updateAvailableOptions(selectedPrintType: PrintType): void {
    switch (selectedPrintType) {
      case PrintType.Customer:
        this.availableOptions = [
          { name: 'Misafir Adı', selected: false, value: '[[customername]]' },
          { name: 'Tarih', selected: false, value: '[[Date]]' },
          { name: 'Hasta', selected: false, value: '[[patient]]' },
          { name: 'Firma Adı', selected: false, value: '[[company]]' },
          { name: 'Randevu Tipi', selected: false, value: '[[appointtpe]]' },
        ];
        break;
      case PrintType.Patient:
        this.availableOptions = [
          { name: 'Hasta Adı', selected: false, value: '[[patientname]]' },
          { name: 'Hasta Yaşı', selected: false, value: '[[patientage]]' },
          { name: 'Tarih', selected: false, value: '[[Date]]' },
          { name: 'Doktor Adı', selected: false, value: '[[doctorname]]' },
        ];
        break;
      default:
        this.availableOptions = [];
        break;
    }
  }

  toggleSelection(option: any) {

    const textarea = this.editorElement.nativeElement;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPosition);
    const textAfterCursor = textarea.value.substring(cursorPosition);

    const newText = textBeforeCursor + option.value + textAfterCursor;
    this.printtemplate.controls['templatecontent'].setValue(newText);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = cursorPosition + option.value.length;
    }, 0);


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

  async setHtmlEditorValue(event: any): Promise<void> {
    this.htmlEditorValue = event;
  }



}
