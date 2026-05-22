import { Component, inject, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { DOCUMENT, SlicePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PortfolioDataService } from '../../shared/services/portfolio-data.service';
import { ContactService } from '../../shared/services/contact.service';
import {
  AuroraBackgroundDirective,
  MouseFollowGlowDirective,
  ScrollTriggerDirective,
  MagneticButtonDirective,
  GridBackgroundDirective,
  FloatingTextDirective,
} from '../../shared/directives';
import {
  ParticleNetworkComponent,
  ScrollProgressComponent,
  CustomCursorComponent,
} from '../../shared/components';

@Component({
  selector: 'app-home',
  imports: [
    // Directives
    AuroraBackgroundDirective,
    MouseFollowGlowDirective,
    ScrollTriggerDirective,
    MagneticButtonDirective,
    GridBackgroundDirective,
    FloatingTextDirective,
    // Components
    ParticleNetworkComponent,
    ScrollProgressComponent,
    CustomCursorComponent,
    SlicePipe,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements AfterViewInit {
  protected readonly pds = inject(PortfolioDataService);
  private readonly doc = inject(DOCUMENT);
  private readonly fb = inject(FormBuilder);
  protected readonly contactService = inject(ContactService);

  protected contactForm: FormGroup;
  protected isSubmitting = false;
  protected submitMessage = '';
  protected submitStatus: 'idle' | 'success' | 'error' = 'idle';

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngAfterViewInit() {
    // Defer external script loading until after view is rendered
    if (!this.doc.getElementById('elfsight-script')) {
      const s = this.doc.createElement('script');
      s.id = 'elfsight-script';
      s.src = 'https://static.elfsight.com/platform/platform.js';
      s.async = true;
      s.defer = true;
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          this.doc.body.appendChild(s);
        });
      } else {
        setTimeout(() => {
          this.doc.body.appendChild(s);
        }, 2000);
      }
    }
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
        
        // Clear message after 5 seconds
        setTimeout(() => {
          this.submitStatus = 'idle';
          this.submitMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.submitStatus = 'error';
        this.submitMessage = error.error?.message || 'Error sending message. Please try again.';
        
        // Clear message after 5 seconds
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
}





