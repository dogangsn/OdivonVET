import { PrintType } from "./printType.enum";

export class UpdatePrintTemplateCommand {
    id: string;
    templateName: string = '';
    type: PrintType;
    htmlContent: string = '';
  
    constructor(id:string, templateName: string, type: PrintType, htmlContent: string) {
      this.id = id;
      this.templateName = templateName;
      this.type = type;
      this.htmlContent = htmlContent;
    }
}