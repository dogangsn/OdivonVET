export class DashboardsDto {
    totalCount: DashboardCountTotal;
    upcomingAppointment : any;
    pastAppointment : any;
}

export class DashboardCountTotal {
    dailyAddAppointmentCount: number;
    dailyAddAppointmentCompletedCount: number;
    dailyAddCustomerCount: number;
    DailyAddCustomerYestardayCount: number;
    dailyTurnoverAmount: number;
    dailyTurnoverPreviousAmount: number;
    totalStockAmount: number;
}



