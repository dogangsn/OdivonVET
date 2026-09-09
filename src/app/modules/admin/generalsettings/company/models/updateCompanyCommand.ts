export class UpdateCompanyCommand {
    id:string;
    companyName: string;
    eMail: string;
    phone: string;
    adress: string;
    companyTitle: string;
    tradeName: string;
    taxNumber:Number;
    taxOffice: string;
    defaultInvoiceType: number;
    invoiceAmountNotes: boolean;
    invoiceNoAutoCreate: boolean;
    invoiceSendEMail: boolean;

    constructor(id:string,companyName: string, eMail: string, phone: string, adress: string, companyTitle: string, tradeName: string, taxNumber:Number, taxOffice: string, defaultInvoiceType: number, invoiceAmountNotes: boolean, invoiceNoAutoCreate: boolean,invoiceSendEMail: boolean){
        this.id = id;
        this.companyName = companyName;
        this.eMail = eMail;
        this.phone = phone;
        this.adress = adress;
        this.companyTitle = companyTitle;
        this.tradeName = tradeName;
        this.taxNumber = taxNumber;
        this.taxOffice = taxOffice;
        this.defaultInvoiceType = defaultInvoiceType;
        this.invoiceAmountNotes = invoiceAmountNotes;
        this.invoiceNoAutoCreate = invoiceNoAutoCreate;
        this.invoiceSendEMail = invoiceSendEMail
    }
}