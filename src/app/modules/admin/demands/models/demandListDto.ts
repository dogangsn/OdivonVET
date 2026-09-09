import { demandProductsListDto } from "../demand1/models/demandProductsListDto";

export class demandsListDto {
    id: string;
    date:string;
    documentno:string;
    suppliers:string;
    deliverydate:string;
    note:string;
    state:number;
    iscomplated:boolean;
    demandProductList : demandProductsListDto[];
    selected: boolean;
    isBuying: boolean;
    isAccounting: boolean;
}



export interface InventoryBrand
{
    id: string;
    name: string;
    slug: string;
}


export interface InventoryCategory
{
    id: string;
    parentId: string;
    name: string;
    slug: string;
}
export interface InventoryPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface InventoryTag
{
    id?: string;
    title?: string;
}

export interface InventoryVendor
{
    id: string;
    name: string;
    slug: string;
}
export class demandTransList{
    id: string;
   // id: string;
    productId:string;
    quantity:number;
    unitprice:number;
    amount:number;
    stockState:number;
    isActive:number;
    reserved:number;
    barcode:string;
    ownerId:string;
    taxisId: string;
    constructor(
        id: string ,
        productId:string,
        quantity:number,
        unitprice:number,
        amount:number,
        stockState:number,
        isActive:number,
        reserved:number,
        barcode:string,
        ownerId:string,
        taxisId: string
        ) {
        this.id = id;
        this.productId = productId;
        this.quantity = quantity;
        this.unitprice = unitprice;
        this.amount = amount;
        this.stockState = stockState;
        this.isActive = isActive;
        this.reserved = reserved;
        this.barcode = barcode;
        this.ownerId = ownerId;
        this.taxisId = taxisId;

    }

}