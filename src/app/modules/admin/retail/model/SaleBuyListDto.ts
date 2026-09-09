export class SaleBuyListDto {
    id: string;
    ownerId : string;
    date: string;
    invoiceNo: string;
    supplierName: string;
    customerName: string;
    paymentName: string;
    type: number;
    total: number;
    discount: number;
    netPrice: number;
    price: number;
    kdv: number;
    customerId: string;
    supplierId: string;
    remark: string;
    amount : number;
    productId: string;
    productName : string;
    paymentType: number;
    isPaymentCollected: boolean;
}
