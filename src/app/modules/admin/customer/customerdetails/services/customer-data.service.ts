// customer-data.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomerDataService {
  customerId: string;
  patientId: string;

  constructor() { }

  setCustomerId(id: string) {
    this.customerId = id;
  }

  getCustomerId() {
    return this.customerId;
  }

  setPatientId(id: string) {
    this.patientId = id;
  }

  getPatientId() {
    return this.patientId;
  }
}
