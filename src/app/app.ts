import { Component } from '@angular/core';
import { PortfolioHome } from './components/portfolio-home/portfolio-home';

@Component({
  selector: 'app-root',
  imports: [
    PortfolioHome,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'my-portfolio';


}
