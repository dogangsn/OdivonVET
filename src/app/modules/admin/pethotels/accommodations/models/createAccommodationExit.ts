export class  CreateAccommodationExit {
    accomodationId: string;
    customerId?: string;
    patientsId?: string;
    roomId: string;
    checkinDate: Date;
    checkOutDate: Date;
    accomodationAmount: number;
    collectionAmount: number;
    paymentId: number;

    constructor(
        accomodationId: string,
        customerId: string | undefined,
        patientsId: string | undefined,
        roomId: string,
        checkinDate: Date,
        checkOutDate: Date,
        accomodationAmount: number,
        collectionAmount: number,
        paymentId: number
    ) {
        this.accomodationId = accomodationId;
        this.customerId = customerId;
        this.patientsId = patientsId;
        this.roomId = roomId;
        this.checkinDate = checkinDate;
        this.checkOutDate = checkOutDate;
        this.accomodationAmount = accomodationAmount;
        this.collectionAmount = collectionAmount;
        this.paymentId = paymentId;
    }
}