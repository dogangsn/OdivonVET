export enum PrintType {
    Customer = 1,
    Patient = 2,
    Accomodation = 3,
    Farm = 4,
    Accounting = 5,
    Product = 6,
    Examination = 7,
  }


  export const PrintTypeDisplay: { [key in PrintType]: string } = {
    [PrintType.Customer]: 'Müşteri',
    [PrintType.Patient]: 'Hasta',
    [PrintType.Accomodation]: 'Konaklama',
    [PrintType.Farm]: 'Çiftlik',
    [PrintType.Accounting]: 'Muhasebe',
    [PrintType.Product]: 'Ürün',
    [PrintType.Examination]: 'Muayene'
  };