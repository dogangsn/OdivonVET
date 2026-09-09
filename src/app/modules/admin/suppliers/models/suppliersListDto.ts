import { InvoiceType } from "./CreateSuppliersCommand";

export class suppliersListDto {
    id: string;
    suppliername:string;
    email: string;
    phone: string;
    active:boolean
    adress: string;
    invoiceType: InvoiceType;
    companyName: string; 
    webSite: string;
    taxOffice: string;
    taxNumber: string;

}