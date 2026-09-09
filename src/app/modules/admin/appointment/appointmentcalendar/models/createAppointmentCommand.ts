import { th } from "date-fns/locale";
import { addVaccineDto } from "./addVaccineDto";

 

export class CreateAppointmentCommand{
    beginDate : Date;
    doctorId : string;
    customerId : string;
    note : string;
    appointmentType : number;
    status : number;
    patientId: string;
    vaccineItems: addVaccineDto[];

    constructor(beginDate: Date,doctorId : string, customerId: string, note : string, appointmentType:number, status: number,  patientId: string, vaccineItems: addVaccineDto[]){
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