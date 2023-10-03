import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactiveFormStepOneComponent } from './reactive-form-step-one.component';

describe('ReactiveFormStepOneComponent', () => {
  let component: ReactiveFormStepOneComponent;
  let fixture: ComponentFixture<ReactiveFormStepOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReactiveFormStepOneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReactiveFormStepOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
