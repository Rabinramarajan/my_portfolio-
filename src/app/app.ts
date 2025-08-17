import { Component } from '@angular/core';
import { Home } from './home/home';

@Component({
  selector: 'app-root',
  imports: [
    Home,
  ],
  template: '<app-home />',
})
export class App {
  protected title = 'my-portfolio';


}
