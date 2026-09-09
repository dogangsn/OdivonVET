export class CreateSmsParametersCommand {
    active : boolean;
    userName : string;
    password : string;
    smsIntegrationType : number;

    constructor(active : boolean,userName : string,password : string, smsIntegrationType : number ) {
        this.active = active;
        this.userName = userName;
        this.password = password;
        this.smsIntegrationType = smsIntegrationType;
    }
}