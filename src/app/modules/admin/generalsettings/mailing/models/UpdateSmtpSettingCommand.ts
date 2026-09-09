export class UpdateSmtpSettingCommand {
    id: string;
    defaults: boolean;
    displayName: string;
    emailId : string;
    password: string;
    host: string;
    port: number;
    useSSL: boolean;

    constructor(id:string, defaults: boolean, displayName: string, emailId : string, password: string, host: string, port:number, useSSL: boolean) {
        this.id = id;
        this.defaults = defaults;
        this.displayName = displayName;
        this.emailId = emailId;
        this.password = password;
        this.host = host;
        this.port = port;
        this.useSSL  = useSSL;
    }
}