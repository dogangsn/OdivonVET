export class UpdateDemandProductsCommand {
    id: string;
    remark:string;
    quantity:number;
    unitprice:number;
    amount:number;
    stockState:number;
    isActive:number;
    reserved:number;
    barcode:string;

    constructor(
        id: string ,
        remark:string,
        quantity:number,
        unitprice:number,
        amount:number,
        stockState:number,
        isActive:number,
        reserved:number,
        barcode:string,
        ) {
        this.id = id;
        this.remark = remark;
        this.quantity = quantity;
        this.unitprice = unitprice;
        this.amount = amount;
        this.stockState = stockState;
        this.isActive = isActive;
        this.reserved = reserved;
        this.barcode = barcode;

    }
    
}
