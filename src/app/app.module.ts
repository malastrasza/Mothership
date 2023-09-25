import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormComponent } from './courses/angular-university/forms/components/reactive-form/reactive-form.component';
import { InfoComponent } from './courses/angular-university/forms/components/template-driven-form/info.component';
import { CapitalLetterDirective } from './courses/angular-university/forms/directives/capitalLetter.directive';
import { PriorityErrorPipe } from './courses/angular-university/forms/pipes/priority-error.pipe';
import { AuiSliderComponent } from './my/custom-components/slider/slider.component';
import { NavComponent } from './nav/nav.component';
// import { AuiSliderModule } from './components/slider/slider.module';

@NgModule({
  declarations: [
    AppComponent,
    InfoComponent,
    PriorityErrorPipe,
    CapitalLetterDirective,
    AuiSliderComponent,
    ReactiveFormComponent,
    NavComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    // Angular Material Imports
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
