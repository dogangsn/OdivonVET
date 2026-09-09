export class CreateSuppliersCommand {
    public supplierName: string;
    public email: string;
    public phone: string;
    public active: boolean;
    public adress: string;
    public invoiceType: InvoiceType;
    public companyName: string; 
    public webSite: string;
    public taxOffice: string;
    public taxNumber: string;

    constructor(
        supplierName: string = '',
        email: string = '',
        phone: string = '',
        active: boolean = false,
        adress: string = '',
        invoiceType: InvoiceType,
        companyName: string = '', 
        webSite: string = '',
        taxOffice: string = '',
        taxNumber: string = ''
    ) {
        this.supplierName = supplierName;
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

export enum InvoiceType {
    Institutional = 1, // Kurumsal
    Individual = 2 // Bireysel
}
