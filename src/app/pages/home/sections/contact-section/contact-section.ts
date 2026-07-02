import { Component, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PortfolioDataService } from '../../../../shared/services/portfolio-data.service';
import { ContactService } from '../../../../shared/services/contact.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-contact-section',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-section.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactSection {
  protected readonly pds = inject(PortfolioDataService);
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);
  private readonly toastService = inject(ToastService);

  protected readonly contactForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.minLength(5)]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  protected readonly isSubmitting = signal(false);
  protected readonly submitMessage = signal('');
  protected readonly submitStatus = signal<'idle' | 'success' | 'error'>('idle');

  protected submitContact(): void {
    if (this.contactForm.invalid || this.isSubmitting()) {
      if (this.contactForm.invalid) this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitStatus.set('idle');

    this.contactService.submitContact(this.contactForm.value).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.submitStatus.set('success');
        this.submitMessage.set(response.message);
        this.contactForm.reset();
        this.toastService.success(response.message);
        setTimeout(() => {
          this.submitStatus.set('idle');
          this.submitMessage.set('');
        }, 5000);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.submitStatus.set('error');
        const msg = error?.message || 'Error sending message. Please try again.';
        this.submitMessage.set(msg);
        this.toastService.error(msg);
        setTimeout(() => {
          this.submitStatus.set('idle');
          this.submitMessage.set('');
        }, 5000);
      },
    });
  }

  protected getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('email')) return 'Invalid email format';
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
    }
    return '';
  }
}
