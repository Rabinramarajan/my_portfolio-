import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, type AbstractControl } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import {
  BUDGET_RANGES,
  PROJECT_BRIEF_MAX,
  PROJECT_BRIEF_MIN,
  PROJECT_TYPES,
  TIMELINES,
  type ContactRequest,
  type ProjectType,
  type SubmissionState,
} from '../../core/models/contact.models';
import {
  ADDONS,
  BILLING_DISCLAIMER,
  CURRENCY_NOTE,
  CUSTOM_PROJECT,
  FAQS,
  HIRE_SERVICES,
  LOW_BUDGET_NOTE,
  MAINTENANCE_NOTE,
  MAINTENANCE_PLANS,
  PACKAGES,
  PRICING_DISCLAIMER,
  TRUST_POINTS,
  type HirePackage,
} from '../../core/config/hire.content';
import { Button } from '../../shared/components/button/button';
import { ContactApi } from '../../core/services/contact-api';
import { CursorTarget } from '../../shared/directives/cursor-target';
import { SITE_URL } from '../../core/config/portfolio.content';
import { PortfolioStore } from '../../core/services/portfolio-store';
import { Reveal } from '../../shared/directives/reveal';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { Seo } from '../../core/services/seo';
import { breadcrumbSchema } from '../../core/services/structured-data';

interface PackagePreset {
  readonly service: string | null;
  readonly type: ProjectType;
  readonly budget: (typeof BUDGET_RANGES)[number];
  readonly timeline: (typeof TIMELINES)[number] | null;
}

const PACKAGE_PRESETS: Record<HirePackage['id'] | 'custom', PackagePreset> = {
  starter: {
    service: 'Premium Portfolio',
    type: 'Portfolio',
    budget: '₹25,000 – ₹50,000',
    timeline: '1–2 weeks',
  },
  professional: {
    service: 'Angular Development',
    type: 'SaaS',
    budget: '₹50,000 – ₹1,00,000',
    timeline: '2–4 weeks',
  },
  premium: {
    service: 'Custom Web Application',
    type: 'Custom Application',
    budget: '₹1,00,000 – ₹2,50,000',
    timeline: '1–2 months',
  },
  custom: {
    service: null,
    type: 'Custom Application',
    budget: 'Not sure yet',
    timeline: null,
  },
};

/**
 * The Hire Me page — a project-discovery and quotation experience rather than a
 * bare contact form. Selection state is signals; the form is the single source
 * of truth for what actually gets submitted.
 */
@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, SectionHeader, Button, Reveal, CursorTarget],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ContactApi);
  private readonly seo = inject(Seo);
  private readonly store = inject(PortfolioStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly projectTypes = PROJECT_TYPES;
  protected readonly budgets = BUDGET_RANGES;
  protected readonly timelines = TIMELINES;
  protected readonly briefMin = PROJECT_BRIEF_MIN;
  protected readonly briefMax = PROJECT_BRIEF_MAX;

  protected readonly services = HIRE_SERVICES;
  protected readonly packages = PACKAGES;
  protected readonly customProject = CUSTOM_PROJECT;
  protected readonly addons = ADDONS;
  protected readonly maintenancePlans = MAINTENANCE_PLANS;
  protected readonly faqs = FAQS;
  protected readonly trustPoints = TRUST_POINTS;
  protected readonly pricingDisclaimer = PRICING_DISCLAIMER;
  protected readonly billingDisclaimer = BILLING_DISCLAIMER;
  protected readonly currencyNote = CURRENCY_NOTE;
  protected readonly lowBudgetNote = LOW_BUDGET_NOTE;
  protected readonly maintenanceNote = MAINTENANCE_NOTE;

  protected readonly profile = this.store.profile;
  protected readonly media = this.store.media;

  protected readonly phoneHref = computed(() => {
    const phone = this.profile().phone;
    return phone ? `tel:${phone.replace(/[^+\d]/g, '')}` : null;
  });

  /* ---- Discovery selection state (Signals) ---- */
  protected readonly selectedService = signal<string | null>(null);
  protected readonly addOns = signal<string[]>([]);
  protected readonly openFaq = signal<number | null>(0);
  protected readonly addonsOpen = signal(false);

  /** Submission lifecycle: idle → validating → submitting → success | error. */
  protected readonly state = signal<SubmissionState>('idle');
  protected readonly feedback = signal('');
  protected readonly serverErrors = signal<Record<string, string>>({});
  protected readonly submitting = computed(
    () => this.state() === 'validating' || this.state() === 'submitting',
  );

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    company: ['', [Validators.maxLength(120)]],
    phone: ['', [Validators.maxLength(40)]],
    url: ['', [Validators.maxLength(300)]],
    service: [''],
    projectType: [PROJECT_TYPES[0] as ProjectType, [Validators.required]],
    budget: [BUDGET_RANGES[BUDGET_RANGES.length - 1], [Validators.required]],
    timeline: [TIMELINES[TIMELINES.length - 1]],
    message: [
      '',
      [
        Validators.required,
        Validators.minLength(PROJECT_BRIEF_MIN),
        Validators.maxLength(PROJECT_BRIEF_MAX),
      ],
    ],
    // Honeypot. Hidden from users and from assistive tech; bots fill it in.
    website: [''],
  });

  /**
   * The form's value as a signal.
   *
   * A `FormControl.value` is a plain property, not a reactive source — a
   * `computed()` reading it directly is never invalidated, so anything derived
   * from the form silently freezes on its first value. This is the one place
   * the stream is bridged; every derivation below reads it.
   */
  private readonly formValue = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  protected readonly briefCount = computed(() => this.formValue().message.length);
  protected readonly briefRemaining = computed(
    () => this.briefMax - this.formValue().message.length,
  );

  protected readonly hasSelection = computed(
    () =>
      Boolean(this.selectedService()) ||
      this.addOns().length > 0 ||
      this.formValue().projectType !== PROJECT_TYPES[0] ||
      this.formValue().timeline !== TIMELINES[TIMELINES.length - 1],
  );

  /** Live rows for the smart quote summary. */
  protected readonly summary = computed(() => {
    const rows: { label: string; value: string }[] = [];
    const value = this.formValue();
    const service = this.selectedService();
    const addons = this.addOns();

    if (service) rows.push({ label: 'Service', value: service });
    rows.push({ label: 'Project', value: value.projectType });
    rows.push({ label: 'Budget', value: value.budget });
    if (value.timeline) rows.push({ label: 'Timeline', value: value.timeline });
    if (addons.length) rows.push({ label: 'Add-ons', value: addons.join(', ') });
    return rows;
  });

  /** "Estimated starting point" — never a promise of a final price. */
  protected readonly estimate = computed(() => {
    const service = this.selectedService();
    if (!service) return null;
    return this.services.find((s) => s.title === service)?.startingFrom ?? null;
  });

  constructor() {
    this.seo.apply({
      title: `Contact Rabin R | Angular Developer & Frontend Consultant`,
      description: `Tell Rabin R what you're building. Transparent starting prices for Angular development, premium websites, dashboards, SSR and more. Response within one business day.`,
      path: '/contact',
    });
    this.seo.setStructuredData(
      breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Contact', url: `${SITE_URL}/contact` },
      ]),
    );
  }

  protected isSelected(control: AbstractControl, value: string): boolean {
    return control.value === value;
  }

  protected invalid(name: string): boolean {
    const control = this.form.get(name);
    return Boolean(control && control.invalid && (control.dirty || control.touched));
  }

  protected errorFor(name: string): string | null {
    const serverError = this.serverErrors()[name];
    if (serverError) return serverError;
    const control = this.form.get(name);
    if (!control || !this.invalid(name)) return null;
    return describeError(control, name);
  }

  /* ---- Selection handlers ---- */

  protected selectService(title: string): void {
    this.selectedService.set(title);
    this.form.controls.service.setValue(title);
    this.scrollToForm();
  }

  protected selectType(type: ProjectType): void {
    this.form.controls.projectType.setValue(type);
    this.form.controls.projectType.markAsTouched();
  }

  protected selectBudget(budget: (typeof BUDGET_RANGES)[number]): void {
    this.form.controls.budget.setValue(budget);
    this.form.controls.budget.markAsTouched();
  }

  protected selectTimeline(timeline: (typeof TIMELINES)[number]): void {
    this.form.controls.timeline.setValue(timeline);
    this.form.controls.timeline.markAsTouched();
  }

  protected toggleAddon(label: string): void {
    this.addOns.update((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
    );
  }

  protected isAddonSelected(label: string): boolean {
    return this.addOns().includes(label);
  }

  protected toggleFaq(index: number): void {
    this.openFaq.update((current) => (current === index ? null : index));
  }

  protected applyPreset(id: HirePackage['id'] | 'custom'): void {
    const preset = PACKAGE_PRESETS[id];
    this.selectedService.set(preset.service);
    this.form.controls.service.setValue(preset.service ?? '');
    this.form.controls.projectType.setValue(preset.type);
    this.form.controls.budget.setValue(preset.budget);
    if (preset.timeline) {
      this.form.controls.timeline.setValue(preset.timeline);
    }
    this.scrollToForm();
  }

  protected scrollToForm(): void {
    this.scrollToSection('start-project');
  }

  /**
   * Scrolls to a section by id.
   *
   * Deliberately not an `href="#id"` anchor: with `<base href="/">` a bare
   * fragment resolves against the *base* URL, so clicking one on /contact
   * navigates to the home page instead of moving down the page.
   */
  protected scrollToSection(id: string): void {
    const section = this.host.nativeElement.querySelector<HTMLElement>(`#${id}`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    section?.focus({ preventScroll: true });
  }

  protected submit(): void {
    if (this.submitting()) return;

    this.serverErrors.set({});
    this.form.markAllAsTouched();
    this.state.set('validating');

    if (this.form.invalid) {
      this.state.set('error');
      this.feedback.set(
        'Please complete the highlighted fields — they help me give you a useful first reply.',
      );
      return;
    }

    this.state.set('submitting');
    this.feedback.set('');

    const payload: ContactRequest = {
      ...this.form.getRawValue(),
      service: this.selectedService() ?? '',
      addOns: this.addOns(),
    };

    this.api
      .send(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        if (response.success) {
          this.state.set('success');
          this.feedback.set(response.message);
          this.addOns.set([]);
          this.selectedService.set(null);
          this.form.reset({
            projectType: PROJECT_TYPES[0],
            budget: BUDGET_RANGES[BUDGET_RANGES.length - 1],
            timeline: TIMELINES[TIMELINES.length - 1],
          });
        } else {
          this.state.set('error');
          this.feedback.set(response.message);
          this.serverErrors.set({ ...response.errors });
        }
      });
  }
}

/** Turns a failing control into a sentence a person can act on. */
function describeError(control: AbstractControl, name: string): string {
  const errors = control.errors ?? {};
  if (errors['required']) return `${labelFor(name)} is required.`;
  if (errors['email']) return 'Please enter a valid email address.';
  if (errors['minlength']) {
    const { requiredLength } = errors['minlength'] as { requiredLength: number };
    return `${labelFor(name)} must be at least ${requiredLength} characters.`;
  }
  if (errors['maxlength']) {
    const { requiredLength } = errors['maxlength'] as { requiredLength: number };
    return `${labelFor(name)} must be under ${requiredLength} characters.`;
  }
  return `${labelFor(name)} is not valid.`;
}

function labelFor(name: string): string {
  const labels: Record<string, string> = {
    name: 'Name',
    email: 'Email',
    company: 'Company',
    phone: 'Phone',
    url: 'Website / existing product URL',
    projectType: 'Project type',
    budget: 'Budget',
    timeline: 'Timeline',
    message: 'Project brief',
  };
  return labels[name] ?? name;
}
