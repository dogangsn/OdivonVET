export class UpdateUnitsCommand {
    id:string;
    unitCode: string;
    unitName: string;

    constructor(id: string,unitCode: string, unitName: string) {
        this.id = id;
        this.unitCode = unitCode;
        this.unitName = unitName;
    }
}
