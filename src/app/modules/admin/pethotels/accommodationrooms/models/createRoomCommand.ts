export class CreateRoomCommand {
    roomName: string = '';
    price: number = 0;
    pricingType: number;

    constructor(roomName: string, price: number, pricingType: number) {
        this.roomName = roomName;
        this.price = price;
        this.pricingType = pricingType;
    }

}