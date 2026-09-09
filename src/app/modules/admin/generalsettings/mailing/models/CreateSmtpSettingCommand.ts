export class CreateSmtpSettingCommand {
    defaults: boolean;
    displayName: string;
    emailId : string;
    password: string;
    host: string;
    port: number;
    useSSL: boolean;

    constructor(defaults: boolean, displayName: string, emailId : string, password: string, host: string, port:number, useSSL: boolean) {
        this.defaults = defaults;
        this.displayName = displayName;
        this.emailId = emailId;
        this.password = password;
        this.host = host;
        this.port = port;
        this.useSSL  = useSSL;
    }
}