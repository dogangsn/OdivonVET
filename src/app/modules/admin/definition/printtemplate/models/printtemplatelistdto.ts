import { PrintType } from "./printType.enum";

export class PrintTemplateListDto {
    id : string;
    templateName: string = '';
    type: PrintType;
    htmlContent: string = '';   
}