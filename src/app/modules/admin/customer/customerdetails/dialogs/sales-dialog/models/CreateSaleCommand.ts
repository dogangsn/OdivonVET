import { SalesDto } from "./salesDto";

export class CreateSaleCommand {
    date : Date;
    remark : string;
    customerId : string;
    trans : SalesDto[];
}