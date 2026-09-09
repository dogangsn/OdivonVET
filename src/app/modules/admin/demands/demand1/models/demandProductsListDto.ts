export class demandProductsListDto {
    id: string;
    productId:string;
    quantity:number;
    unitprice:number;
    amount:number;
    stockState:number;
    isActive:number;
    reserved:number;
    barcode:string;
    selected: boolean;
    taxisId:string;
    
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