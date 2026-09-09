import { AbstractControl, ValidatorFn } from "@angular/forms";

export function CustomNumericValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      const isValid = /^\d+(\.\d{1,2})?$/.test(value);
      return !isValid ? { 'invalidNumber': { value: control.value } } : null;
    };
  }