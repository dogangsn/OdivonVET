import { DateTime } from "luxon";

export class DailyAppointmentListDto {
    id:string;
    date: DateTime;
    customerPatientName: string;
    services: string;
    status : string;
    statusName : string;
    customerId: string;
    doctorId: string;
    note:string;
    beginDate: string;
    endDate: string;
}