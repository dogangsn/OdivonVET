export class UpdateAppointmentCommand {
    id : string;
    beginDate : Date;
    customerId : string;
    note : string;
    appointmentType : number;
    vaccineId : string;

    constructor(id: string, beginDate: Date, customerId: string, note : string, appointmentType:number, vaccineId: string){
        this.id = id;
        this.beginDate = beginDate;
        this.customerId = customerId;
        this.note = note;
        this.appointmentType = appointmentType;
        this.vaccineId = vaccineId;
    }
}