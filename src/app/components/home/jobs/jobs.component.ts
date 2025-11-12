import { Component, OnInit, AfterViewInit, ElementRef, inject } from '@angular/core';
import { AnalyticsService } from '../../../services/analytics/analytics';
import { AnimationsService } from '../../../services/animations/animations.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-jobs',
  imports: [CarouselModule, TranslateModule, NgbNavModule],
  providers: [
    TranslateService
  ],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
})
export class JobsComponent implements OnInit, AfterViewInit {

  active = 0;

  private readonly analytics = inject(AnalyticsService);
  private readonly animations = inject(AnimationsService);
  private readonly elementRef = inject(ElementRef);

  constructor(

  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initAnimations();
  }

  private initAnimations(): void {
    const jobsSection = this.elementRef.nativeElement;

    const title = jobsSection.querySelector('.about-title');
    if (title) {
      this.animations.observeElement(title, {
        type: 'slideInUp',
        duration: 1000
      });
    }

    const tabsContainer = jobsSection.querySelector('.jobs-tabs');
    if (tabsContainer) {
      this.animations.observeElement(tabsContainer as HTMLElement, {
        type: 'fadeInUp',
        duration: 1200,
        delay: 300
      });
    }

    const tabs = jobsSection.querySelectorAll('li[ngbNavItem]');
    tabs.forEach((tab: HTMLElement, index: number) => {
      this.animations.observeElement(tab, {
        type: 'scaleIn',
        delay: 600 + (index * 150)
      });

      this.animations.addHoverEffects(tab, ['lift']);
    });


    setTimeout(() => {
      const jobDescriptions = jobsSection.querySelectorAll('.job-description');
      jobDescriptions.forEach((desc: HTMLElement, index: number) => {
        this.animations.observeElement(desc, {
          type: 'fadeInLeft',
          delay: index * 200
        });
      });
    }, 1000);
  }
}
