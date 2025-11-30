import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { PROFILE } from '../../core/data/portfolio.data';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ContactComponent {
  profile = PROFILE;
  contactForm: FormGroup;
  isSubmitting = signal(false);
  isSubmitted = signal(false);

  contactInfo = [
    {
      icon: 'mail',
      label: 'Email',
      value: this.profile.email,
      link: `mailto:${this.profile.email}`
    },
    {
      icon: 'phone',
      label: 'Phone',
      value: this.profile.phone,
      link: `tel:${this.profile.phone}`
    },
    {
      icon: 'globe',
      label: 'Website',
      value: this.profile.website,
      link: `https://${this.profile.website}`
    }
  ];

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  get formControls() {
    return this.contactForm.controls;
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting.set(true);
      
      setTimeout(() => {
        this.isSubmitting.set(false);
        this.isSubmitted.set(true);
        this.contactForm.reset();
        
        setTimeout(() => {
          this.isSubmitted.set(false);
        }, 5000);
      }, 1500);
    } else {
      Object.keys(this.formControls).forEach(key => {
        const control = this.formControls[key];
        if (control.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
