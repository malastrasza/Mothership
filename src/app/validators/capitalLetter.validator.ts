import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function capitalLetterValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    return !/[A-Z]+/.test(value) ? { capitalLetter: true } : null;
  };
}
