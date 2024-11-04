import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSettingsService } from './common/services/app-settings/app-settings.service';
import { Maintenance } from './common/templates/maintenance';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Maintenance],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'myPortfolio';

  constructor(public appSetting: AppSettingsService) {
  }

  ngOnInit(): void {
  
  }
}
