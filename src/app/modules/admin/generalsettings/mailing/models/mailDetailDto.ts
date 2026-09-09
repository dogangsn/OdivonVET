export class MailDetailDto{
    emailToId: string;
    emailToName: string;
    emailSubject : string;
    emailBody: string;
    connectionString: string;

    constructor(emailToId: string, emailToName: string,emailSubject : string , emailBody: string, connectionString: string){
        this.emailToId = emailToId;
        this.emailToName = emailToName;
        this.emailSubject = emailSubject;
        this.emailBody = emailBody;
        this.connectionString = connectionString;
    }
}