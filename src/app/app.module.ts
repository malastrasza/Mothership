import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InfoComponent } from './info/info.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PriorityErrorPipe } from './pipes/priority-error.pipe';
import { CapitalLetterDirective } from './directives/capitalLetter.directive';
import { AuiSliderComponent } from './components/slider/slider.component';
// import { AuiSliderModule } from './components/slider/slider.module';

@NgModule({
  declarations: [AppComponent, InfoComponent, PriorityErrorPipe, CapitalLetterDirective, AuiSliderComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule
    
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
