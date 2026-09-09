export class LabDocumentDetailDto {
    id: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    patientName: string;
    patientType: string;
    patientBreed: string;
    labDocuments: LabDocumentDto[];
}

export class LabDocumentDto {
    documentId: string;
    documentType: string;
    documentName: string;
    documentDate: Date;
    documentStatus: string;
}