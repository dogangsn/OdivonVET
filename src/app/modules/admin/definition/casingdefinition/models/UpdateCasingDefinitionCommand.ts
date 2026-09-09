export class UpdateCasingDefinitionCommand {
    id: string;
    casename: string;
    active: boolean;

    constructor(id:string,casename: string, active: boolean) {
        this.id = id;
        this.casename = casename;
        this.active = active;
    }
}
