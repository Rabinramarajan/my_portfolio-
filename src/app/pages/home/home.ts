import { Component, inject, ChangeDetectionStrategy, OnDestroy, afterNextRender } from '@angular/core';
import { PortfolioDataService } from '../../shared/services/portfolio-data.service';
import { GsapService } from '../../shared/services/gsap.service';
import { ScrollProgressComponent, ParticleNetworkComponent } from '../../shared/components';
import { HeroSection } from './sections/hero-section/hero-section';
import { AboutSection } from './sections/about-section/about-section';
import { ExperienceSection } from './sections/experience-section/experience-section';
import { SkillsSection } from './sections/skills-section/skills-section';
import { ProjectsSection } from './sections/projects-section/projects-section';
import { ResumeSection } from './sections/resume-section/resume-section';
import { TestimonialsSection } from './sections/testimonials-section/testimonials-section';
import { LinkedInSection } from './sections/linkedin-section/linkedin-section';
import { ContactSection } from './sections/contact-section/contact-section';

@Component({
  selector: 'app-home',
  imports: [
    ScrollProgressComponent,
    ParticleNetworkComponent,
    HeroSection,
    AboutSection,
    ExperienceSection,
    SkillsSection,
    ProjectsSection,
    ResumeSection,
    TestimonialsSection,
    LinkedInSection,
    ContactSection,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnDestroy {
  protected readonly pds = inject(PortfolioDataService);
  private readonly gsapService = inject(GsapService);

  constructor() {
    afterNextRender(() => this.initGsapAnimations());
  }

  private async initGsapAnimations(): Promise<void> {
    try {
      await this.gsapService.init();
      if (!this.gsapService.isLoaded) return;

      const heroTl = this.gsapService.createTimeline({
        trigger: '.hero',
        start: 'top top',
        toggleActions: 'play none none none',
      });

      if (heroTl) {
        heroTl
          .from('.hero-badge', { y: 20, opacity: 0, duration: 0.6 })
          .from('.hero-title', { y: 30, opacity: 0, duration: 0.8 }, '-=0.3')
          .from('.hero-desc', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
          .from('.hero-actions', { y: 20, opacity: 0, duration: 0.6 }, '-=0.3')
          .from('.hero-stack', { y: 20, opacity: 0, duration: 0.6 }, '-=0.3')
          .from('.hero-stats .stat-card', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.3')
          .from('.hero-visual', { x: 40, opacity: 0, duration: 0.8 }, '-=0.8');
      }

      this.gsapService.gsap?.from('.timeline-line', {
        scaleY: 0,
        transformOrigin: 'top center',
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.timeline',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      this.gsapService.staggerIn('.skill-card', 0.06);
      this.gsapService.staggerIn('.proj-card-enhanced', 0.12);
      this.gsapService.staggerIn('.testi-card', 0.1);
    } catch (e) {
      console.warn('GSAP initialization failed, falling back to CSS animations', e);
    }
  }

  ngOnDestroy(): void {
    this.gsapService.killAll();
  }
}
