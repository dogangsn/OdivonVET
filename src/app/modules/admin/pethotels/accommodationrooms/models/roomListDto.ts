export class RoomListDto {
    id: string;
    roomName: string = '';
    price: number = 0;
    pricingType: RoomPriceType = RoomPriceType.Daily;
}

enum RoomPriceType {
    Daily = 1,
    Hour = 2,
}