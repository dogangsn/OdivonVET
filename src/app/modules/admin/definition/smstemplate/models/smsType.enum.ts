export enum SmsType {
  AppointmentReminder = 1,
  PaymentReminder = 2
}


export const SmsTypeDisplay: { [key in SmsType]: string } = {
  [SmsType.AppointmentReminder]: 'Randevu Hatırlatma',
  [SmsType.PaymentReminder]: 'Borç Hatırlatma',

};