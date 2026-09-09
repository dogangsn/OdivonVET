export class SmtpSettingsDto{
    id: string;
    defaults: boolean;
    displayName: string;
    emailId : string;
    password: string;
    host: string;
    port: number;
    useSSL: boolean;
}