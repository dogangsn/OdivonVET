export class AppointmentTypesDto{
    id: string;
    type: number;
    remark : string;
    isDefaultPrice: boolean = false;
    price: number;
    taxisId: string;
    colors: string;
}