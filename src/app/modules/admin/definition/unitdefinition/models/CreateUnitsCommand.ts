export class CreateUnitsCommand {
    unitCode: string;
    unitName: string;

    constructor(unitCode: string, unitName: string) {
        this.unitCode = unitCode;
        this.unitName = unitName;
    }
}
