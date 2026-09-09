import { addVaccineDto } from "./addVaccineDto";

export class UpdateAppointmentCommand {
    id: string;
    beginDate : Date;
    doctorId : string;
    customerId : string;
    note : string;
    appointmentType : number;
    status : number;
    patientId: string;
    vaccineItems: addVaccineDto[];

    constructor(id: string, beginDate: Date,doctorId : string, customerId: string, note : string, appointmentType:number, status: number,  patientId: string, vaccineItems: addVaccineDto[]){
        this.id = id;
        this.beginDate = beginDate;
        this.doctorId = doctorId;
        this.customerId = customerId;
        this.note = note;
        this.appointmentType = appointmentType;
        this.status = status;
        this.patientId = patientId;
        this.vaccineItems = vaccineItems;
    }
}