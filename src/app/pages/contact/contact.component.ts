import { Component, signal, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { PROFILE } from '../../core/data/portfolio.data';
import { FIREBASE_FIRESTORE, FIREBASE_ANALYTICS } from '../../core/firebase/firebase.di';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';
import { ContactService } from './contact.service';

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
        animate('0.6s cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerCards', [
      transition(':enter', [
        query('.info-card', [
          style({ opacity: 0, transform: 'translateX(-30px)' }),
          stagger(100, [
            animate('0.6s cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('formPulse', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('0.6s cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class ContactComponent {
  // Inject Firebase services
  private firestore = inject(FIREBASE_FIRESTORE);
  private analytics = inject(FIREBASE_ANALYTICS);
  private contact = inject(ContactService);

  profile = PROFILE;
  contactForm: FormGroup;
  isSubmitting = signal(false);
  isSubmitted = signal(false);
  errorMessage = signal<string | null>(null);
  hoveredCard = signal<string | null>(null);

  contactInfo = [
    {
      id: 'email',
      icon: 'mail',
      label: 'Email',
      value: this.profile.email,
      link: `mailto:${this.profile.email}`
    },
    {
      id: 'phone',
      icon: 'phone',
      label: 'Phone',
      value: this.profile.phone,
      link: `tel:${this.profile.phone}`
    },
    // {
    //   id: 'website',
    //   icon: 'globe',
    //   label: 'Website',
    //   value: this.profile.website,
    //   link: `https://${this.profile.website}`
    // }
  ];

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.contactForm = this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });

    // Email sending is handled by Firebase Cloud Functions on Firestore writes
  }

  get formControls() {
    return this.contactForm.controls;
  }

  setHoveredCard(cardId: string | null): void {
    this.hoveredCard.set(cardId);
  }

  isCardHovered(cardId: string): boolean {
    return this.hoveredCard() === cardId;
  }

  async onSubmit(): Promise<void> {
    if (this.contactForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      try {
        const formData = this.contactForm.value;

        // Save to Firestore
        await addDoc(collection(this.firestore, 'contact_messages'), {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          createdAt: serverTimestamp(),
          status: 'unread'
        });

        // Track event in Analytics
        if (this.analytics) {
          logEvent(this.analytics, 'contact_form_submit', {
            subject: formData.subject
          });
        }

        // Email will be sent by Cloud Function triggered on new document

        // Mark for check since we're using async operations in zoneless mode
        this.cdr.markForCheck();
        this.isSubmitting.set(false);
        this.isSubmitted.set(true);
        this.contactForm.reset();

        setTimeout(() => {
          this.isSubmitted.set(false);
          this.cdr.markForCheck();
        }, 5000);
      } catch (error) {
        console.error('Email sending error:', error);
        this.errorMessage.set('Failed to send message. Please try again.');
        this.isSubmitting.set(false);
        this.cdr.markForCheck();
      }
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
