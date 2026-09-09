import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { FormControl } from '@angular/forms';
import { parametersListDto } from './models/parametersListDto';
import { ParametersService } from 'app/core/services/settings/parameters.service';
import { Observable, Subject, takeUntil, zip } from 'rxjs';
import { UpdateParametersCommand } from './models/UpdateParametersCommand';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { TranslocoService } from '@ngneat/transloco';
import { casingDefinitionListDto } from '../../definition/casingdefinition/models/casingDefinitionListDto';
import { CasingDefinitionService } from 'app/core/services/definition/CasingDefinition/casingdefinition.service';
import { SmsParametersDto } from '../smsparameters/models/smsParameterDto';
import { SmsIntegrationType } from './models/smsCompany.enum';
// import { MatDialogRef } from '@angular/material/dialog';
// import { }
@Component({
    selector: 'app-parameters',
    templateUrl: './parameters.component.html',
    styleUrls: ['./parameters.component.css'],
})

export class ParametersComponent implements OnInit {
    parameters: UntypedFormGroup;
    days: string[] = [
        'Pazartesi',
        'Salı',
        'Çarşamba',
        'Perşembe',
        'Cuma',
        'Cumartesi',
        'Pazar',
    ];
    times = [
        '8:00',
        '9:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00',
        '19:00',
        '20:00',
        '21:00',
        '22:00',
        '23:00',
        '24:00',
    ]
    selectedDays = new FormControl([]);
    allselectcheck: string = 'Tümünü Seç';
    checkAllSelect: boolean = false;
    getParameters: parametersListDto[];
    weeks: string = '';
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    updateid: string = '';
    casingcards: casingDefinitionListDto[] = [];
    selectedCasingId: any = '';
    loader = true;

    smsparameters: SmsParametersDto[] = []
    destroy$: Subject<boolean> = new Subject<boolean>();

    mapsmsintegrationyype: { name: string; id: number }[] = [];
    shouldShowAppointmentInterval = false;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _parametersService: ParametersService,
        private cdr: ChangeDetectorRef,
        private _translocoService: TranslocoService,
        private _casingdefinitionService: CasingDefinitionService
    ) // private _dialogRef: MatDialogRef<any>,

    { }

    ngOnInit() {

        for (var n in SmsIntegrationType) {
            if (typeof SmsIntegrationType[n] === 'number') {
                this.mapsmsintegrationyype.push({ id: <any>SmsIntegrationType[n], name: n });
            }
        }



        this.getCasingDefinition();
        this.getParametersList();

        zip(
            this.getSmsParametersList(),
        ).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (value) => {
                this.setProducesResponse(value[0])
            },
            error: (e) => {
                console.log(e);
            },
            complete: () => {

            }
        });


        this.parameters = this._formBuilder.group({
            id: [''],
            appointmentReminderDuration: [0], // Randevi Hatırlatma Süresi // number
            smsCompany: [''], // sms Şirketleri - GuidId
            agendaNoteReminder: [0], //Ajanda Notu Hatırlatma -number
            days: [[]], // Çalışma Günleri - string
            cashAccount: [''], // Nakit Kasa Hesabı -GuidId
            creditCardCashAccount: [''], // Kredi Kartı Kasa Hesabı -GuidId
            bankTransferCashAccount: [''], // Banka Havale Kasa Hesabı -GuidId
            whatsappTemplate: [''], //Whatsapp Şablonu GuidId
            customerWelcomeTemplate: [''], //Müşteri Hoşgeldin Şablonu -GuidId
            isOtoCustomerWelcomeMessage: [false], //Otomatik Müşteri Hoşgeldin Mesajı - Check
            autoSms: [false], // Otomatik Sms - check
            displayVetNo: [false], // Veteriner Numarası Gözüksün - check
            automaticAppointmentReminderMessageTemplate: [''], // Otomatik Randevu Hatırlatma Mesajı Şablonu // GuidId
            isAnimalsBreeds: [false],
            isFirstInspection: [false],
            appointmentBeginDate: [''],
            appointmentEndDate: [''],
            isExaminationAmuntZero: [false],
            datetimestatus: [0],
            appointmentinterval: [0],
            appointmentSeansDuration : [0],
            petHotelsDateTimeFormat: [0]
        });

        this.parameters.get('datetimestatus')?.valueChanges.subscribe(value => {
            this.shouldShowAppointmentInterval = value === 1;
        });

    }

    ngAfterViewInit() {
        debugger;
        //   this._casingdefinitionService.getCasingDefinitionList().subscribe((response) => {
        //     debugger;

        //     if(response.data.length !== 0)
        //     {
        //       const casingId = response.data[0].id;
        //       this.parameters = this._formBuilder.group({
        //         id : [""],
        //         appointmentReminderDuration: [0], // Randevi Hatırlatma Süresi // number
        //         smsCompany: [""], // sms Şirketleri - GuidId
        //         agendaNoteReminder: [0], //Ajanda Notu Hatırlatma -number
        //         days: [[]],  // Çalışma Günleri - string
        //         cashAccount: [this.parameters.value.cashAccount.length !== 0 ? this.parameters.value.cashAccount : casingId], // Nakit Kasa Hesabı -GuidId
        //         creditCardCashAccount: [this.parameters.value.creditCardCashAccount.length !== 0 ? this.parameters.value.creditCardCashAccount : casingId],  // Kredi Kartı Kasa Hesabı -GuidId
        //         bankTransferCashAccount: [this.parameters.value.bankTransferCashAccount.length !== 0 ? this.parameters.value.bankTransferCashAccount : casingId], // Banka Havale Kasa Hesabı -GuidId
        //         whatsappTemplate: [""], //Whatsapp Şablonu GuidId
        //         customerWelcomeTemplate: [""],  //Müşteri Hoşgeldin Şablonu -GuidId
        //         isOtoCustomerWelcomeMessage: [false], //Otomatik Müşteri Hoşgeldin Mesajı - Check
        //         autoSms: [false],  // Otomatik Sms - check
        //         displayVetNo: [false], // Veteriner Numarası Gözüksün - check
        //         automaticAppointmentReminderMessageTemplate: [""], // Otomatik Randevu Hatırlatma Mesajı Şablonu // GuidId
        //         isAnimalsBreeds: [false]
        //       });
        //     }

        // });
    }

    isEndDateDisabled(startTime: string): boolean {
        const startHour = parseInt(startTime.split(':')[0]);
        const endHour = parseInt(this.parameters.value.appointmentEndDate.split(':')[0]);
        return endHour <= startHour;
    }

    isBeginDateDisabled(startTime: string): boolean {
        const startHour = parseInt(startTime.split(':')[0]);
        const endHour = parseInt(this.parameters.value.appointmentBeginDate.split(':')[0]);
        return endHour >= startHour;
    }

    getCasingDefinition() {
        this._casingdefinitionService
            .getCasingDefinitionList()
            .subscribe((response) => {
                this.casingcards = response.data;

                console.log(this.casingcards);
            });
    }

    getParametersList() {
        this._parametersService
            .getparameterList()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                if (response && response.data) {
                    this.getParameters = response.data;
                    this.cdr.markForCheck();
                    if (response.data.length > 0) {
                        debugger;
                        this.fillFormData(this.getParameters);
                    }
                }
            });
    }

    fillFormData(getparam: parametersListDto[]) {
        const daysfill = getparam[0].days.split(',').slice(0, -1);
        if (getparam[0].appointmentBeginDate == "") {
            getparam[0].appointmentBeginDate = "10:00";
            getparam[0].appointmentEndDate = "19:00";
        }
        if (this.getParameters !== null) {
            this.parameters.setValue({
                id: getparam[0].id,
                appointmentReminderDuration:
                    getparam[0].appointmentReminderDuration,
                smsCompany: getparam[0].smsCompany,
                agendaNoteReminder: getparam[0].agendaNoteReminder,
                days: daysfill,
                cashAccount: getparam[0].cashAccount,
                creditCardCashAccount: getparam[0].creditCardCashAccount,
                bankTransferCashAccount: getparam[0].bankTransferCashAccount,
                whatsappTemplate: getparam[0].whatsappTemplate,
                customerWelcomeTemplate: getparam[0].customerWelcomeTemplate,
                isOtoCustomerWelcomeMessage:
                    getparam[0].isOtoCustomerWelcomeMessage,
                autoSms: getparam[0].autoSms,
                displayVetNo: getparam[0].displayVetNo,
                automaticAppointmentReminderMessageTemplate:
                    getparam[0].automaticAppointmentReminderMessageTemplate,
                isAnimalsBreeds: getparam[0].isAnimalsBreeds,
                isFirstInspection: getparam[0].isFirstInspection,
                appointmentBeginDate: getparam[0].appointmentBeginDate,
                appointmentEndDate: getparam[0].appointmentEndDate,
                isExaminationAmuntZero: getparam[0].isExaminationAmuntZero,
                datetimestatus: getparam[0].datetimestatus,
                appointmentinterval: getparam[0].appointmentinterval,
                appointmentSeansDuration : getparam[0].appointmentSeansDuration,
                petHotelsDateTimeFormat: getparam[0].petHotelsDateTimeFormat
            });
            this.selectedDays.setValue(daysfill);
        }
        this.loader = false;
    }

    filterCustomerId(value: any): void {
        this.selectedCasingId = value;
    }

    onSmsCompanySelectionChange(event: any): void {
        // const selectedProductId = event.value; // Seçilen ürünün id değeri
        //  const selectedProducts = this.productdescription.find(product => product.id === selectedProductId);
        // var total = (selectedProducts.buyingIncludeKDV !== true ?  selectedProducts.buyingPrice * (1 + (selectedProducts.ratio/100) ) : selectedProducts.buyingPrice);
        // var vatSumCalc =  total * (1 + (selectedProducts.ratio/100));
        // var vatSum = vatSumCalc - total;
        // if (selectedProducts) {
        //     this.selectedProductForm.patchValue({
        //         productId: selectedProductId,
        //         barcode: selectedProducts.productBarcode,
        //         isActive: (selectedProducts.active === true ? 1 : 0),
        //         unitPrice: selectedProducts.buyingPrice,
        //         stockState: 0,
        //          reserved: 0,
        //          amount : 0
        //     });
        //     this.selectedProduct.isActive = selectedProducts.active == true ? 1 : 0;
        //    // this.selectedProduct.isActive
        //    //this.selectedProductForm.get('isActive').value === selectedProducts.active == true ? 1 : 0;
        //     this.quantityAdet = selectedProducts.id;
        // }
    }

    oncashAccountSelectionChange(event: any): void { }
    oncreditCardCashAccountSelectionChange(event: any): void { }
    onbankTransferCashAccountSelectionChange(event: any): void { }
    onwhatsappTemplateSelectionChange(event: any): void { }
    oncustomerWelcomeTemplateSelectionChange(event: any): void { }
    onautomaticAppointmentReminderMessageTemplateSelectionChange(
        event: any
    ): void { }
    getFormValueByName(formName: string): any {
        return this.parameters.get(formName).value;
    }

    saveParameter() {
        const dtoListId = this.getParameters.length;
        if (dtoListId === 0) {
            this.updateid = '00000000-0000-0000-0000-000000000000';
        }
        if (dtoListId !== 0) {
            this.updateid = this.getParameters[0].id;
        }
        const parameterItem = new UpdateParametersCommand(
            this.updateid,
            this.getFormValueByName('appointmentReminderDuration'),
            this.getFormValueByName('agendaNoteReminder'),
            this.getFormValueByName('days'),
            this.getFormValueByName('smsCompany') !== ''
                ? this.getFormValueByName('smsCompany')
                : '00000000-0000-0000-0000-000000000000',
            this.getFormValueByName('cashAccount') !== ''
                ? this.getFormValueByName('cashAccount')
                : '00000000-0000-0000-0000-000000000000',
            this.getFormValueByName('creditCardCashAccount') !== ''
                ? this.getFormValueByName('creditCardCashAccount')
                : '00000000-0000-0000-0000-000000000000',
            this.getFormValueByName('bankTransferCashAccount') !== ''
                ? this.getFormValueByName('bankTransferCashAccount')
                : '00000000-0000-0000-0000-000000000000',
            this.getFormValueByName('whatsappTemplate') !== ''
                ? this.getFormValueByName('whatsappTemplate')
                : '00000000-0000-0000-0000-000000000000',
            this.getFormValueByName('customerWelcomeTemplate') !== ''
                ? this.getFormValueByName('customerWelcomeTemplate')
                : '00000000-0000-0000-0000-000000000000',
            this.getFormValueByName(
                'automaticAppointmentReminderMessageTemplate'
            ) !== ''
                ? this.getFormValueByName(
                    'automaticAppointmentReminderMessageTemplate'
                )
                : '00000000-0000-0000-0000-000000000000',
            this.getFormValueByName('isOtoCustomerWelcomeMessage'),
            this.getFormValueByName('displayVetNo'),
            this.getFormValueByName('autoSms'),
            this.getFormValueByName('isAnimalsBreeds'),
            this.getFormValueByName('isFirstInspection'),
            this.getFormValueByName('appointmentBeginDate'),
            this.getFormValueByName('appointmentEndDate'),
            this.getFormValueByName('isExaminationAmuntZero'),
            this.getFormValueByName('datetimestatus'),
            this.getFormValueByName('appointmentinterval'),
            this.getFormValueByName('appointmentSeansDuration'),
            this.getFormValueByName('petHotelsDateTimeFormat'),
        );

        this.selectedDays.value.forEach((x) => {
            this.weeks += x + ',';
        });
        parameterItem.days = this.weeks;
        this._parametersService.updateParameters(parameterItem).subscribe(
            (response) => {
                if (response.isSuccessful) {
                    this.showSweetAlert('success');
                    this.getParametersList();
                    // this._dialogRef.close({
                    //     status: true,
                    // });
                } else {
                    this.showSweetAlert('error');
                }
            },
            (err) => {
                console.log(err);
            }
        );
    }

    selectAllDays(event: any) {
        const ss = event.value;
        if (this.allselectcheck == 'Tümünü Kaldır') {
            this.checkAllSelect = false;
            this.selectedDays.setValue([]);
            this.allselectcheck = 'Tümünü Seç';
        } else {
            this.checkAllSelect = true;
            this.allselectcheck = 'Tümünü Kaldır';
            // this.selectedDays.setValue([this.allselectcheck]);
            this.selectedDays.setValue(this.days);
        }
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

    getSmsParametersList(): Observable<any> {
        return this._parametersService.getSmsParametersList();
    }

    setProducesResponse(response: any): void {
        this.smsparameters = response.data;
    }

    getEnumStringValue(value: number): string {
        switch (value) {
            case SmsIntegrationType.MutluCELL:
                return "MutluCELL";
            default:
                return "Bilinmeyen";
        }
    }

}
