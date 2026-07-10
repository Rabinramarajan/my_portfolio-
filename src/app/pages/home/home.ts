import { Component, inject, ChangeDetectionStrategy, OnDestroy, afterNextRender, signal } from '@angular/core';
import { PortfolioDataService } from '../../shared/services/portfolio-data.service';
import { GsapService } from '../../shared/services/gsap.service';
import { HomeAnimationsService } from './services/home-animations.service';
import {
  ScrollTriggerDirective,
  MagneticButtonDirective,
  StaggerDirective,
} from '../../shared/directives';
import {
  ScrollProgressComponent,
  OpenSourceComponent,
} from '../../shared/components';
import { UiBadgeComponent, UiButtonDirective } from '../../shared/ui';
import { HeroPremiumComponent } from './components/hero/hero-premium.component';
import { AboutComponent } from './components/about/about.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { SkillsComponent } from './components/skills/skills.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { BlogComponent } from './components/blog/blog.component';
import { ContactComponent } from './components/contact/contact.component';
import { LinkedinComponent } from './components/linkedin/linkedin.component';
import { ResumeComponent } from './components/deferred/resume/resume.component';
import { PlaygroundComponent } from './components/deferred/playground/playground.component';

@Component({
  selector: 'app-home',
  imports: [
    // Section Components
    HeroPremiumComponent,
    AboutComponent,
    ExperienceComponent,
    SkillsComponent,
    ProjectsComponent,
    BlogComponent,
    ContactComponent,
    LinkedinComponent,
    // Deferred Components
    ResumeComponent,
    PlaygroundComponent,
    // Directives
    ScrollTriggerDirective,
    // Components
    ScrollProgressComponent,
    OpenSourceComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnDestroy {
  protected readonly pds = inject(PortfolioDataService);
  private readonly gsapService = inject(GsapService);
  private readonly homeAnimations = inject(HomeAnimationsService);

  protected playgroundTabs = [
    { id: 'buttons', label: 'Buttons' },
    { id: 'cards', label: 'Cards & Badges' },
    { id: 'forms', label: 'Forms' },
    { id: 'tokens', label: 'Design Tokens' },
  ];
  protected activePlaygroundTab = signal<string>('buttons');

  protected setActivePlaygroundTab(tabId: string): void {
    this.activePlaygroundTab.set(tabId);
  }

  constructor() {
    afterNextRender(() => {
      this.homeAnimations.initialize();
    });
  }

  ngOnDestroy(): void {
    this.homeAnimations.cleanup();
  }
}
