export class companyDto {
    id:string;
    companyCode: string;
    companyName: string;
    eMail: string;
    phone: string;
    adress: string;
    companyTitle: string;
    tradeName: string;
    taxNumber:Number;
    taxOffice: string;
    defaultInvoiceType: number;
    companyImage: string[];
    buildingName: string;
    buildingNumber: number;
    city: string;
    invoiceAmountNotes: boolean;
    invoiceNoAutoCreate: boolean;
    invoiceSendEMail: boolean;
}