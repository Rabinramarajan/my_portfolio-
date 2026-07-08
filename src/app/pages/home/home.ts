import { Component, inject, ChangeDetectionStrategy, OnDestroy, afterNextRender, signal, computed } from '@angular/core';
import { SlicePipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PortfolioDataService } from '../../shared/services/portfolio-data.service';
import { ContactService } from '../../shared/services/contact.service';
import { ToastService } from '../../shared/services/toast.service';
import { GsapService } from '../../shared/services/gsap.service';
import { HomeAnimationsService } from './services/home-animations.service';
import { environment } from '../../../environments/environment';
import {
  ScrollTriggerDirective,
  MagneticButtonDirective,
  StaggerDirective,
} from '../../shared/directives';
import {
  ScrollProgressComponent,
  ResumeButtonComponent,
  TestimonialsComponent,
  OpenSourceComponent,
  ArrowIconComponent,
} from '../../shared/components';
import { UiBadgeComponent, UiButtonDirective } from '../../shared/ui';
import { HeroComponent } from './components/hero/hero.component';
import { AboutComponent } from './components/about/about.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { SkillsComponent } from './components/skills/skills.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ResumeComponent } from './components/deferred/resume/resume.component';
import { PlaygroundComponent } from './components/deferred/playground/playground.component';

@Component({
  selector: 'app-home',
  imports: [
    // Section Components
    HeroComponent,
    AboutComponent,
    ExperienceComponent,
    SkillsComponent,
    ProjectsComponent,
    // Deferred Components
    ResumeComponent,
    PlaygroundComponent,
    // Directives
    ScrollTriggerDirective,
    MagneticButtonDirective,
    StaggerDirective,
    // Components
    ScrollProgressComponent,
    ResumeButtonComponent,
    TestimonialsComponent,
    OpenSourceComponent,
    ArrowIconComponent,
    UiBadgeComponent,
    UiButtonDirective,
    RouterLink,
    SlicePipe,
    DatePipe,
    ReactiveFormsModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnDestroy {
  protected readonly pds = inject(PortfolioDataService);
  private readonly fb = inject(FormBuilder);
  protected readonly contactService = inject(ContactService);
  private readonly toastService = inject(ToastService);
  private readonly gsapService = inject(GsapService);
  private readonly homeAnimations = inject(HomeAnimationsService);

  protected contactForm: FormGroup;
  protected isSubmitting = false;
  protected submitMessage = '';
  protected submitStatus: 'idle' | 'success' | 'error' = 'idle';
  protected featuredBlogArticles = computed(() => this.pds.blog()?.articles?.slice(0, 3) ?? []);

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
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });

    afterNextRender(() => {
      this.homeAnimations.initialize();
    });
  }

  protected submitContact() {
    if (this.contactForm.invalid || this.isSubmitting) {
      if (this.contactForm.invalid) {
        this.contactForm.markAllAsTouched();
      }
      return;
    }

    this.isSubmitting = true;
    this.submitStatus = 'idle';

    this.contactService.submitContact(this.contactForm.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.submitStatus = 'success';
        this.submitMessage = response.message;
        this.contactForm.reset();
        this.toastService.success(response.message);

        setTimeout(() => {
          this.submitStatus = 'idle';
          this.submitMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.submitStatus = 'error';
        this.submitMessage = error?.message || 'Error sending message. Please try again.';
        this.toastService.error(this.submitMessage);

        setTimeout(() => {
          this.submitStatus = 'idle';
          this.submitMessage = '';
        }, 5000);
      }
    });
  }

  protected getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('email')) {
      return 'Invalid email format';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
    }
    return '';
  }

  ngOnDestroy(): void {
    this.homeAnimations.cleanup();
  }
}
