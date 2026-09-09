export interface SalesDto {
    id: string;
    product: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    discount: number;
    vat: string;
    netPrice : number;
    netVat: number;
}
