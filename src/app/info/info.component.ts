import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent {
  data = {
    username: 'Test',
    password: 'pass'
  }
  
  submit(form: NgForm, event: any) {
    console.log('event: ', event);
    console.log('form: ', form);
    console.log('data: ', this.data);
  }
}
