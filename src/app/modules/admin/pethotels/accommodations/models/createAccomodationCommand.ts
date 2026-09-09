export class CreateAccomodationCommand {
    type: number;
    roomId: string;
    customerId?: string | null;
    patientsId?: string | null;
    checkinDate: Date;
    checkoutDate: Date;
    accomodation: AccomodationType;
    remark: string;

    constructor(
        type: number,
        roomId: string,
        checkinDate: Date,
        checkoutDate: Date,
        accomodation: AccomodationType,
        remark: string = '',
        customerId?: string | null,
        patientsId?: string | null
    ) {
        this.type = type;
        this.roomId = roomId;
        this.customerId = customerId ?? null;
        this.patientsId = patientsId ?? null;
        this.checkinDate = checkinDate;
        this.checkoutDate = checkoutDate;
        this.accomodation = accomodation;
        this.remark = remark;
    }


    
}

export enum AccomodationType {
    Hostel = 1,
    Hospitalization = 2
}
