import { SmsType } from "./smsType.enum";

export class SmsTemplateListDto {
    id: string;
    active: boolean;
    templateName: string;
    templateContent: string;
    enableSMS?: boolean;
    enableAppNotification?: boolean;
    enableEmail?: boolean;
    enableWhatsapp?: boolean;
    smsType : SmsType;
}