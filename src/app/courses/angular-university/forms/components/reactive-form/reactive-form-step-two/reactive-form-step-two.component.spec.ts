import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactiveFormStepTwoComponent } from './reactive-form-step-two.component';

describe('ReactiveFormStepTwoComponent', () => {
  let component: ReactiveFormStepTwoComponent;
  let fixture: ComponentFixture<ReactiveFormStepTwoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReactiveFormStepTwoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReactiveFormStepTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
