import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AnalyticsService } from '../../../services/analytics/analytics';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CarouselModule } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-more-proyects',
  imports: [CarouselModule, TranslateModule],
  providers: [
    TranslateService
  ],
  templateUrl: './more-proyects.component.html',
  styleUrls: ['./more-proyects.component.scss'],
})
export class MoreProyectsComponent implements OnInit {

  public readonly router = inject(Router);
  public readonly analytics = inject(AnalyticsService);

  constructor(

  ) { }

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
  }
  redirect(route: string, event: any) {
    const id = event.target.id;
    if (id == 'demoLink' || id == 'ghLink') {
      return
    }
    window.open(route, '_blank');
  }

}
