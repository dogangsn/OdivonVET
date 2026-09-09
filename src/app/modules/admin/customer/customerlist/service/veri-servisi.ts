import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VeriServisi {
  private patientsVerileri: any[] = [];

  setPatientsVerileri(veriler: any[]) {
    this.patientsVerileri = veriler;
  }

  getPatientsVerileri() {
    return this.patientsVerileri;
  }
}