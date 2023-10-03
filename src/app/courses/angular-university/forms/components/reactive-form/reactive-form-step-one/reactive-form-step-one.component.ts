import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-reactive-form-step-one',
  templateUrl: './reactive-form-step-one.component.html',
  styleUrls: ['./reactive-form-step-one.component.scss'],
})
export class ReactiveFormStepOneComponent {
  form = this.fb.group({
    inputControl: [
      '',
      {
        validators: [Validators.required, Validators.maxLength(20)],
        updateOn: 'blur',
      },
    ],
  });

  constructor(private fb: FormBuilder) {}

  get inputControl() {
    return this.form.controls['inputControl'];
  }
}
