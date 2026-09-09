export class parametersListDto {
    id: string;
    appointmentReminderDuration:number;
    agendaNoteReminder:number ;
    days:string ;
    smsCompany:string ;
    cashAccount:string ;
    creditCardCashAccount:string ;
    bankTransferCashAccount:string ;
    whatsappTemplate:string ;
    customerWelcomeTemplate: string;
    automaticAppointmentReminderMessageTemplate: string ;
    isOtoCustomerWelcomeMessage: boolean ;
    displayVetNo: boolean ;
    autoSms: boolean ;
    isAnimalsBreeds: boolean;
    isFirstInspection: boolean;
    appointmentBeginDate: string;
    appointmentEndDate: string;
    isExaminationAmuntZero : boolean;
    datetimestatus: number;
    appointmentinterval: number;
    appointmentSeansDuration : number;
    petHotelsDateTimeFormat: number;
}