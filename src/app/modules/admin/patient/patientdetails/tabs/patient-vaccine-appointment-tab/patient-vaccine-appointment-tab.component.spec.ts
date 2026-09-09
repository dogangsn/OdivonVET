/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PatientVaccineAppointmentTabComponent } from './patient-vaccine-appointment-tab.component';

describe('PatientVaccineAppointmentTabComponent', () => {
  let component: PatientVaccineAppointmentTabComponent;
  let fixture: ComponentFixture<PatientVaccineAppointmentTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientVaccineAppointmentTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientVaccineAppointmentTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
