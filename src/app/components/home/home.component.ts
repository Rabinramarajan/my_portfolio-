import { Component, inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from '../../services/analytics/analytics';
import { AboutComponent } from './about/about.component';
import { BannerComponent } from './banner/banner.component';
import { ContactComponent } from './contact/contact.component';
import { JobsComponent } from './jobs/jobs.component';
import { MoreProyectsComponent } from './more-proyects/more-proyects.component';
import { ProyectsComponent } from './proyects/proyects.component';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-home',
    imports: [
      BannerComponent,
      AboutComponent,
      JobsComponent,
      ProyectsComponent,
      MoreProyectsComponent,
      ContactComponent,
      NgbNavModule,
    ],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  private analytics = inject(AnalyticsService);

  constructor(

  ) {
  }

  ngOnInit(): void {
    this.analytics.sendAnalyticPageView("/inicio", "Se entro a inicio")
  }


}
