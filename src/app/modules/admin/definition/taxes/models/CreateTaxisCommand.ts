export class CreateTaxisCommand {
    taxName: string;
    taxRatio: number;

    constructor(taxName: string, taxRatio: number) {
        this.taxName = taxName;
        this.taxRatio = taxRatio;
    }

}