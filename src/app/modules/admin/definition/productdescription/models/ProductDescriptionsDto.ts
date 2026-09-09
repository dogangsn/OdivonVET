export class ProductDescriptionsDto{
    
    id: string;
    name:string;
    productBarcode: string;
    productCode: string;
    buyingPrice:number;
    sellingPrice: number;
    active: boolean;
    productTypeId: number;
    unitId: string;
    categoryId: string;
    supplierId: string;
    ratio: number;
    criticalAmount: number;
    sellingIncludeKDV: boolean;
    buyingIncludeKDV: boolean;
    fixPrice: boolean;
    isExpirationDate: boolean;
    animalType:number;
    numberRepetitions: number;
    storeId: string;
    taxisId: string;
    stockCount: number;
    unitName: string;
}