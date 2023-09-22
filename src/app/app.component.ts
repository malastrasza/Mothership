import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  sliderFormControl = new FormControl<number>(1);

  sliderFormControl2 = new FormControl<number>(20);
  sliderFormControl3 = new FormControl<number[]>([25,50]);


  rangeChanged(event: any) {
    // console.log('event: ', event)
  }
}
