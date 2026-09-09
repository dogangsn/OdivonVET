export class CreateProductCategoriesCommand {
    name: string;
    categoryCode: string;

    constructor(name: string, categoryCode: string) {
        this.name = name;
        this.categoryCode = categoryCode;
    }
}
