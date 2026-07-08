import { Injectable, signal, WritableSignal } from '@angular/core';

export interface ContactFormState {
  name: string;
  email: string;
  subject: string;
  message: string;
  isValid: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HomeStateService {
  // UI State Signals
  activePlaygroundTab: WritableSignal<string> = signal('buttons');

  contactFormState: WritableSignal<ContactFormState> = signal({
    name: '',
    email: '',
    subject: '',
    message: '',
    isValid: false
  });

  isContactFormSubmitting: WritableSignal<boolean> = signal(false);
  contactSubmitMessage: WritableSignal<string> = signal('');
  contactSubmitStatus: WritableSignal<'idle' | 'success' | 'error'> = signal('idle');

  // Deferred Loading States
  isResumeLoaded: WritableSignal<boolean> = signal(false);
  isTestimonialsLoaded: WritableSignal<boolean> = signal(false);
  isOpenSourceLoaded: WritableSignal<boolean> = signal(false);
  isBlogLoaded: WritableSignal<boolean> = signal(false);
  isPlaygroundLoaded: WritableSignal<boolean> = signal(false);

  constructor() {}

  // Playground Tab Management
  setActivePlaygroundTab(tabId: string): void {
    this.activePlaygroundTab.set(tabId);
  }

  getActivePlaygroundTab(): string {
    return this.activePlaygroundTab();
  }

  // Contact Form State Management
  updateContactFormField(field: keyof ContactFormState, value: string): void {
    const currentState = this.contactFormState();
    this.contactFormState.set({
      ...currentState,
      [field]: value
    });
  }

  setContactFormState(state: ContactFormState): void {
    this.contactFormState.set(state);
  }

  getContactFormState(): ContactFormState {
    return this.contactFormState();
  }

  resetContactForm(): void {
    this.contactFormState.set({
      name: '',
      email: '',
      subject: '',
      message: '',
      isValid: false
    });
    this.isContactFormSubmitting.set(false);
    this.contactSubmitMessage.set('');
    this.contactSubmitStatus.set('idle');
  }

  // Contact Form Submission State
  setContactFormSubmitting(isSubmitting: boolean): void {
    this.isContactFormSubmitting.set(isSubmitting);
  }

  setContactSubmitMessage(message: string): void {
    this.contactSubmitMessage.set(message);
  }

  setContactSubmitStatus(status: 'idle' | 'success' | 'error'): void {
    this.contactSubmitStatus.set(status);
  }

  // Deferred Loading Tracking
  markResumeLoaded(): void {
    this.isResumeLoaded.set(true);
  }

  markTestimonialsLoaded(): void {
    this.isTestimonialsLoaded.set(true);
  }

  markOpenSourceLoaded(): void {
    this.isOpenSourceLoaded.set(true);
  }

  markBlogLoaded(): void {
    this.isBlogLoaded.set(true);
  }

  markPlaygroundLoaded(): void {
    this.isPlaygroundLoaded.set(true);
  }

  // Reset all state
  resetAllState(): void {
    this.activePlaygroundTab.set('buttons');
    this.resetContactForm();
    this.isResumeLoaded.set(false);
    this.isTestimonialsLoaded.set(false);
    this.isOpenSourceLoaded.set(false);
    this.isBlogLoaded.set(false);
    this.isPlaygroundLoaded.set(false);
  }
}
