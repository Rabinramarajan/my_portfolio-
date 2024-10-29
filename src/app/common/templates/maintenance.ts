import { Component, OnInit } from "@angular/core";
import { AppSettingsService } from "../services/app-settings/app-settings.service";
import { AppSafePipe } from "../pipes/app-safe/app-safe.pipe";

@Component({
    selector: 'app-maintenance',
    standalone: true,
    imports: [AppSafePipe],
    template: `
    <div class="wrapper">
  <div class="maintain-center">
    <div class="user-selection">
      <div class="title">Site Under Maintenance</div>
      <div class="selections">
        <div class="maintenance-img">
          <img src="image/coming_soon.png" alt="">
        </div>
      </div>
      <div class="selection-footnote" [innerHTML]="textHtml | appSafe: 'html'"></div>
    </div>
  </div>
</div>
    `
})

export class Maintenance implements OnInit {

    textHtml = ` `;

    constructor(private setting: AppSettingsService) {
        this.textHtml = this.setting.environment.maintenanceText;
    }

    ngOnInit(): void {

    }
}
