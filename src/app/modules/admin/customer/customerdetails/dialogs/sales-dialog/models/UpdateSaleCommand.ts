import { SalesDto } from "./salesDto";

export class UpdateSaleCommand {
    id : string;
    date : Date;
    remark : string; 
    trans : SalesDto[];
}