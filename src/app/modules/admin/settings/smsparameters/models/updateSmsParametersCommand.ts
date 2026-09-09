export class UpdateSmsParametersCommand {
    id: string;
    active : boolean;
    userName : string;
    password : string;
    smsIntegrationType : number;

    constructor(id: string, active : boolean,userName : string,password : string, smsIntegrationType : number ) {
        this.id = id;
        this.active = active;
        this.userName = userName;
        this.password = password;
        this.smsIntegrationType = smsIntegrationType;
    }
}