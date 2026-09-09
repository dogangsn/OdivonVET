export class CreateDemandProductsCommand {
   // id: string;
    productId:string;
    quantity:number;
    unitprice:number;
    amount:number;
    stockState:number;
    isActive:number;
    reserved:number;
    barcode:string;

    constructor(
       // id: string ,
        productId:string,
        quantity:number,
        unitprice:number,
        amount:number,
        stockState:number,
        isActive:number,
        reserved:number,
        barcode:string,
        ) {
        //this.id = id;
        this.productId = productId;
        this.quantity = quantity;
        this.unitprice = unitprice;
        this.amount = amount;
        this.stockState = stockState;
        this.isActive = isActive;
        this.reserved = reserved;
        this.barcode = barcode;

    }
}
