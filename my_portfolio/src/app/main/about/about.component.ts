import { Component } from '@angular/core';
import { Row } from '../../common/core-component/core-component.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [Row],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {

}
