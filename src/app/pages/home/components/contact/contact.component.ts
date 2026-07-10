import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PortfolioDataService } from '../../../../shared/services/portfolio-data.service';
import { ContactService } from '../../../../shared/services/contact.service';
import { ToastService } from '../../../../shared/services/toast.service';

interface ContactChannel {
  key: string;
  label: string;
  value: string;
  href: string;
  tint: string;
  icon: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  protected readonly pds = inject(PortfolioDataService);
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);
  private readonly toastService = inject(ToastService);

  protected contactForm: FormGroup;
  protected isSubmitting = false;
  protected submitMessage = '';
  protected submitStatus: 'idle' | 'success' | 'error' = 'idle';

  quote = {
    text: 'Great things in business are never done by one person. They\'re done by a team of people.',
    author: 'Steve Jobs',
  };

  availableFor = ['Freelance Projects', 'Full-time Opportunities', 'Collaborations', 'Tech Discussions'];

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  private meta(): Record<string, string> {
    return (this.pds.meta() as Record<string, string> | undefined) ?? {};
  }

  get channels(): ContactChannel[] {
    const m = this.meta();
    const website = (m['website'] || '').replace(/^https?:\/\//, '');
    return [
      { key: 'email', label: 'Email', value: m['email'] || '', href: 'mailto:' + (m['email'] || ''), tint: '#a855f7', icon: 'M2 4h20a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM2 6l10 6 10-6' },
      { key: 'phone', label: 'Phone', value: m['phone'] || '', href: 'tel:' + (m['phone'] || '').replace(/\s/g, ''), tint: '#38bdf8', icon: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z' },
      { key: 'location', label: 'Location', value: m['location'] || '', href: this.mapUrl, tint: '#22c55e', icon: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z' },
      { key: 'website', label: 'Website', value: website, href: m['website'] || '#', tint: '#f59e0b', icon: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z' },
    ];
  }

  get locationName(): string {
    return this.meta()['location'] || 'Chennai, Tamil Nadu, India';
  }

  get mapUrl(): string {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(this.locationName);
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
      },
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

  protected isInvalid(field: string): boolean {
    const c = this.contactForm.get(field);
    return !!(c && c.invalid && c.touched);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
