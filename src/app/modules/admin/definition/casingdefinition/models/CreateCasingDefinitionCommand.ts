export class CreateCasingDefinitionCommand {
    casename: string;
    active: boolean;

    constructor(casename: string, active: boolean) {
        this.casename = casename;
        this.active = active;
    }
}
