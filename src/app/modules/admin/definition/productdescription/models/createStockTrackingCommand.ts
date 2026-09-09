export class CreateStockTrackingCommand {

    ProductId: string;
    Status: boolean = true;
    ProcessType: ProcessTypes = ProcessTypes.NewStock;
    Type: StockTrackingType;
    Piece: number;
    PurchasePrice: number;
    SupplierId?: string;
    ExpirationDate?: Date;

    constructor(productId: string, type: StockTrackingType, piece: number, purchasePrice: number ,supplierId?: string, expirationDate?: Date) {
        this.ProductId = productId;
        this.Type = type;
        this.Piece = piece;
        this.PurchasePrice = purchasePrice;
        this.SupplierId = supplierId;
        this.ExpirationDate = expirationDate;
    }

}

export enum StockTrackingType {
    Entry = 1,
    Exit = 2
}

export enum ProcessTypes {
    NewStock = 1,
    Transfer = 2,
    Tuning = 3,
    Other = 4
}
