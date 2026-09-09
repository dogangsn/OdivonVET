export class CreateStoreCommand {
    depotCode: string;
    depotName: string;
    active:boolean;

    constructor(depotCode: string, depotName: string, active:boolean) {
        this.depotCode = depotCode;
        this.depotName = depotName;
        this.active = active;
    }
}
