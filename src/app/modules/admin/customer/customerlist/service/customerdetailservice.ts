import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CustomerDetailsComponent } from '../../customerdetails/customerdetails.component';

@Injectable({
  providedIn: 'root'
})
export class CustomerDetailsService {
  private customerDetailsSource = new BehaviorSubject<CustomerDetailsComponent | null>(null);
  customerDetails$ = this.customerDetailsSource.asObservable();

  setCustomerDetails(customerDetails: CustomerDetailsComponent) {
    this.customerDetailsSource.next(customerDetails);
  }
  
}