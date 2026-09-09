export class UpdateStoreCommand {
    id : string;
    depotCode: string;
    depotName: string;
    active:boolean;

    constructor(id:string, depotCode: string, depotName: string, active:boolean) {
        this.id = id;
        this.depotCode = depotCode;
        this.depotName = depotName;
        this.active = active;
    }
}