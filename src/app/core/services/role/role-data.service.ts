// customer-data.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleDataService {
  roleId: string;
  patientId: string;

  constructor() { }

  setRoleId(id: string) {
    this.roleId = id;
  }

  getRoleId() {
    return this.roleId;
  }

}
