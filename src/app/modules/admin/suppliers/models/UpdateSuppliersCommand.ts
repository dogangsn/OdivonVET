import { InvoiceType } from "./CreateSuppliersCommand";

export class UpdateSuppliersCommand {
    id: string;
    suppliername: string;
    email: string;
    phone: string;
    active: boolean;
    public adress: string;
    public invoiceType: InvoiceType;
    public companyName: string; 
    public webSite: string;
    public taxOffice: string;
    public taxNumber: string;


    constructor(id:string,suppliername: string,email: string,phone: string, active: boolean,
        adress: string = '',
        invoiceType: InvoiceType,
        companyName: string = '', 
        webSite: string = '',
        taxOffice: string = '',
        taxNumber: string = ''
    ) {
        this.id = id;
        this.suppliername = suppliername;
        this.email = email;
        this.phone = phone;
        this.active = active;
        this.adress = adress;
        this.invoiceType = invoiceType;
        this.companyName = companyName; 
        this.webSite = webSite;
        this.taxOffice = taxOffice;
        this.taxNumber = taxNumber;
    }
}
