import { addVaccineDto } from "./addVaccineDto";


export class AppointmentDto {
    id: string;
    customerId:string;
    doctorId: string;
    note:string;
    beginDate: Date;
    endDate: Date;
    appointmentType: number;
    text: string;
    isComplated: boolean;
    vaccineId: string;
    status : number;
    patientsId : string;
    date : Date;
    vaccineItems: addVaccineDto[];
    // constructor(
    //     customerId:string,
    //     doctorId: string,
    //     note:string,
    //     beginDate: string,
    //     endDate: string,
    //     ) {
    //     this.customerId = customerId;
    //     this.doctorId = doctorId;
    //     this.note = note;
    //     this.beginDate = beginDate;
    //     this.endDate = endDate;

    // }
}
