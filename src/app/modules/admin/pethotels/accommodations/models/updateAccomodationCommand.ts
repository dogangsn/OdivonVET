import { AccomodationType } from "./createAccomodationCommand";

export class UpdateAccomodationCommand {
    id: string;
    type: number;
    roomId: string;
    customerId?: string | null;
    patientsId?: string | null;
    checkinDate: Date;
    checkoutDate: Date;
    accomodation: AccomodationType;
    remark: string;

    constructor(
        id: string,
        type: number,
        roomId: string,
        checkinDate: Date,
        checkoutDate: Date,
        accomodation: AccomodationType,
        remark: string = '',
        customerId?: string | null,
        patientsId?: string | null
    ) {
        this.id = id;
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