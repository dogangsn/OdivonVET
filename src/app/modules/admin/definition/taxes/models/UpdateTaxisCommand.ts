export class UpdateTaxisCommand {
    id: string;
    taxName: string;
    taxRatio: number;

    constructor(id: string,taxName: string, taxRatio: number) {
        this.id = id;
        this.taxName = taxName;
        this.taxRatio = taxRatio;
    }
}