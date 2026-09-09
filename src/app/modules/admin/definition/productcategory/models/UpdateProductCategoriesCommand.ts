export class UpdateProductCategoriesCommand {
    Id: string;
    name: string;
    categoryCode: string;

    constructor(Id:string,name: string, categoryCode: string) {
        this.Id = Id;
        this.name = name;
        this.categoryCode = categoryCode;
    }
}
