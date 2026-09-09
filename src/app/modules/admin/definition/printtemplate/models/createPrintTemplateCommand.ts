import { PrintType } from "./printType.enum";

export class CreatePrintTemplateCommand {
    templateName: string = '';
    type: PrintType;
    htmlContent: string = '';
  
    constructor(templateName: string, type: PrintType, htmlContent: string) {
      this.templateName = templateName;
      this.type = type;
      this.htmlContent = htmlContent;
    }
  }