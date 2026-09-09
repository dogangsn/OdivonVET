export class AppointmentDashboardDto {
    totalAppointmentWeek?: number;
    totalAppointmentMonth?: number;
    totalAppointmentYear?: number;
    totalCompletedAppointments?: number;
    monthlyAppointmentCounts?: number[];
    monthlyAppointmentCompletedCounts? : number[];
}