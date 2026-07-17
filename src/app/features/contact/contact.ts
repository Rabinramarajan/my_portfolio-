import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { email, form, FormField, minLength, required, submit } from '@angular/forms/signals';
import { DataService, EmailService, trackById, AccentColor } from '../../core';
import { Breadcrumb, GlassCard, AnimatedButton, Footer, ResponsiveImage } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';

interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY: ContactMessage = { name: '', email: '', subject: '', message: '' };

/** Contact page (design 6) — powered by Angular Signal Forms. */
@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, Icon, Breadcrumb, GlassCard, AnimatedButton, Footer, ResponsiveImage],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  host: { class: 'block' },
})
export class ContactPage {
  private readonly data = inject(DataService);
  private readonly emailService = inject(EmailService);

  protected readonly contact = this.data.load('contact');

  /** Reactive form model + schema (Signal Forms). */
  protected readonly model = signal<ContactMessage>({ ...EMPTY });
  protected readonly contactForm = form(this.model, (path) => {
    required(path.name, { message: 'Please enter your name' });
    required(path.email, { message: 'Please enter your email' });
    email(path.email, { message: 'Please enter a valid email address' });
    required(path.subject, { message: 'Please enter a subject' });
    required(path.message, { message: 'Please enter a message' });
    minLength(path.message, 10, { message: 'Message must be at least 10 characters' });
  });

  protected readonly sending = signal(false);
  protected readonly sent = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly trackById = trackById;

  /** Accent token that drives a contact-channel icon-badge color (see contact.scss). */
  protected badgeAccent(accent: AccentColor = 'purple'): AccentColor {
    return accent;
  }

  /** Submit via Signal Forms; validation runs automatically, then send via EmailJS. */
  protected async onSubmit(): Promise<void> {
    this.sending.set(true);
    this.sent.set(false);
    this.error.set(null);

    await submit(this.contactForm, async () => {
      if (!this.emailService.isConfigured) {
        this.error.set('Email service is not configured yet. Please try again later.');
        return undefined;
      }
      try {
        await this.emailService.send({ ...this.model() });
        this.sent.set(true);
        this.model.set({ ...EMPTY });
        // Clear touched/dirty state so validation errors don't linger on the
        // now-empty fields (reset() does not change the data model itself).
        this.contactForm().reset();
      } catch (err) {
        this.error.set(this.getErrorMessage(err));
        console.error('Contact form submission error:', err);
      }
      return undefined;
    });

    this.sending.set(false);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('network') || message.includes('failed to fetch')) {
        return 'Network error. Please check your connection and try again.';
      }
      if (message.includes('timeout')) {
        return 'Request timed out. Please try again.';
      }
    }
    return 'Something went wrong while sending your message. Please try again or contact the site owner.';
  }
}
