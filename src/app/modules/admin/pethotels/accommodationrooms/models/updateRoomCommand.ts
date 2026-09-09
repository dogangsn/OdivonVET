export class UpdateRoomCommand {
    id : string;
    roomName: string = '';
    price: number = 0;
    pricingType: number;

    constructor(id: string,roomName: string, price: number, pricingType: number) {
        this.id = id;
        this.roomName = roomName;
        this.price = price;
        this.pricingType = pricingType;
    }
}