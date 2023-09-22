import { Directive } from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { capitalLetterValidator } from '../validators/capitalLetter.validator';

@Directive({
  selector: '[capitalLetter]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: CapitalLetterDirective,
      multi: true,
    },
  ],
})
export class CapitalLetterDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return capitalLetterValidator()(control);
  }
}
