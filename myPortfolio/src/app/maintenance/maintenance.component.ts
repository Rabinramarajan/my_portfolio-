import { Component } from '@angular/core';
import { AppSettingsService } from '../common/services/app-settings/app-settings.service';
import { AppSafePipe } from '../common/pipes/app-safe/app-safe.pipe';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [AppSafePipe],
  templateUrl: './maintenance.component.html',
  styleUrl: './maintenance.component.scss'
})
export class MaintenanceComponent {
  textHtml = ` `;

  constructor(private setting: AppSettingsService){
    this.textHtml = this.setting.environment.maintenanceText;
  }
}
