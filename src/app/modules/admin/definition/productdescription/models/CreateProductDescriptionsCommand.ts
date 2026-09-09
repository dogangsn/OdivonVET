export class CreateProductDescriptionsCommand {
    name:string;
    unitId: string;
    categoryId: string;
    productTypeId: number;
    supplierId: string;
    productBarcode: string;
    productCode: string;
    buyingPrice:number;
    sellingPrice: number;
    criticalAmount: number;
    active: boolean;
    sellingIncludeKDV: boolean;
    buyingIncludeKDV:boolean;
    fixPrice:boolean;
    isExpirationDate : boolean;
    animalType: number;
    numberRepetitions: number;
    storeId : string;
    taxisId: string;

    constructor(
        name:string,
        unitId: string,
        categoryId: string,
        productTypeId: number,
        supplierId: string,
        productBarcode: string,
        productCode: string,
        buyingPrice:number,
        sellingPrice: number,
        criticalAmount: number,
        active: boolean,
        sellingIncludeKDV: boolean,
        buyingIncludeKDV:boolean,
        fixPrice:boolean,
        isExpirationDate : boolean,
        animalType: number,
        numberRepetitions: number,
        storeId : string,
        taxisId: string
    ){
        this.name = name;
        this.unitId = unitId;
        this.categoryId = categoryId;
        this.productTypeId = productTypeId;
        this.supplierId = supplierId;
        this.productCode = productCode;
        this.productBarcode = productBarcode;
        this.buyingPrice = buyingPrice;
        this.sellingPrice = sellingPrice;
        this.criticalAmount = criticalAmount;
        this.active = active;
        this.sellingIncludeKDV = sellingIncludeKDV;
        this.buyingIncludeKDV = buyingIncludeKDV;
        this.fixPrice = fixPrice;
        this.isExpirationDate = isExpirationDate;
        this.animalType = animalType;
        this.numberRepetitions = numberRepetitions;
        this.storeId = storeId;
        this.taxisId = taxisId;

    }

}
