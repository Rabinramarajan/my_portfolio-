---
title: "Building Enterprise Angular Form Controls with @zellavora/ng-input"
description: "A deep dive into designing reusable, signals-first form controls for Angular 21+ — text, password, select, textarea, validation, and support for Reactive, Template-Driven, and Signal Forms."
tags: ["Angular", "Signals", "Forms", "Enterprise", "TypeScript"]
author: "Rabin R"
date: "2026-07-03"
readingTime: "11 min read"
---

> **Note:** `@zellavora/ng-input` is presented here as a design study. The APIs and benchmark figures below are **illustrative** — realistic Angular 21 patterns used to explain the architecture, not measurements from a shipped release.

## Why Angular projects need reusable form controls

Every non-trivial Angular application is, underneath the routing and the dashboards, a *forms* application. Onboarding wizards, settings panels, search filters, checkout flows — they are all inputs, validation, and submission. And yet the humble `<input>` is where most enterprise codebases quietly rot.

The reason is simple: a raw `<input>` is never *just* an input. In a real product it needs a label, a hint, an error slot, ARIA wiring, a disabled state, a loading state, a prefix/suffix icon, consistent focus styling, and integration with whatever forms API your team standardized on. Multiply that by forty screens and six teams, and you get forty subtly different implementations of the same control.

A reusable form-control library exists to collapse that surface area into one audited, accessible, themeable primitive. Done well, it becomes the single place where accessibility fixes, design-token changes, and validation conventions live.

## Problems with duplicated input components

Before introducing a solution, it's worth being precise about what duplication actually costs, because "we have some copy-pasted inputs" rarely sounds urgent to a product owner.

**1. Accessibility drift.** One team wires `aria-describedby` to the error message; another forgets. Screen-reader users get an inconsistent experience, and your accessibility audit produces forty near-identical tickets.

**2. Validation inconsistency.** Team A shows errors on blur, Team B on submit, Team C on every keystroke. Users experience the same app as three different products.

**3. Design-system decay.** A designer changes the focus ring from 2px to 3px. In a duplicated world that's a forty-file pull request. In a componentized world it's one line.

**4. Testing surface explosion.** Each bespoke input needs its own unit tests — or, more realistically, gets none.

**5. Forms-API lock-in.** The killer problem. A component built tightly around `ReactiveFormsModule` can't be dropped into a template-driven screen or the new Signal Forms without a rewrite.

The last point is the one most libraries get wrong, so it's where `@zellavora/ng-input` starts.

## Introducing @zellavora/ng-input

`@zellavora/ng-input` is a set of standalone, signals-first form controls built for Angular 21+. The design goals:

- **One control, three forms APIs.** Every control implements `ControlValueAccessor`, so it works with Reactive Forms, Template-Driven Forms, and the experimental Signal Forms without per-consumer glue.
- **Signals internally.** State (`value`, `focused`, `disabled`, `touched`) is modeled with signals, so change detection is precise and the library is fully zoneless-compatible.
- **SSR-safe.** No `window`/`document` access at construction; all DOM work is guarded and deferred.
- **Accessible by default.** Labels, hints, and errors are wired to the input via generated IDs and `aria-*` attributes you can't forget to add.

```bash
npm install @zellavora/ng-input
```

Every control is standalone — no `NgModule`:

```ts
import { ZvTextInput, ZvSelect } from '@zellavora/ng-input';

@Component({
  selector: 'app-profile',
  imports: [ZvTextInput, ZvSelect],
  template: `
    <zv-text-input label="Full name" [(value)]="name" />
  `,
})
export class ProfileComponent {
  name = signal('');
}
```

## The controls

### Text Input

The workhorse. A two-way `value` model backed by a signal, with slots for label, hint, prefix, and suffix.

```ts
@Component({
  selector: 'app-example',
  imports: [ZvTextInput],
  template: `
    <zv-text-input
      label="Email"
      type="email"
      hint="We'll never share it"
      [(value)]="email"
      [required]="true">
      <svg zvPrefix><!-- mail icon --></svg>
    </zv-text-input>
  `,
})
export class ExampleComponent {
  email = signal('');
}
```

Internally, the control is a model signal plus a small amount of state:

```ts
@Component({
  selector: 'zv-text-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  /* template + styles */
})
export class ZvTextInput implements ControlValueAccessor {
  readonly value = model<string>('');
  readonly label = input<string>();
  readonly hint = input<string>();
  readonly required = input(false, { transform: booleanAttribute });

  protected readonly focused = signal(false);
  protected readonly disabled = signal(false);
  protected readonly touched = signal(false);

  // Stable, SSR-safe unique id for label/aria wiring
  protected readonly id = `zv-${Math.random().toString(36).slice(2)}`;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: string): void { this.value.set(v ?? ''); }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  protected handleInput(next: string): void {
    this.value.set(next);
    this.onChange(next);
  }

  protected handleBlur(): void {
    this.touched.set(true);
    this.focused.set(false);
    this.onTouched();
  }
}
```

The important detail: because `value` is a `model()`, the *same* component serves `[(value)]` two-way binding **and** `ControlValueAccessor`. Consumers pick whichever they need.

### Password Input

Password is text input plus a visibility toggle and a strength meter — both common enough that copy-pasting them across screens is the exact anti-pattern we're eliminating.

```ts
@Component({
  template: `
    <zv-password-input
      label="Password"
      [(value)]="password"
      [showStrength]="true"
      [minScore]="3" />
  `,
})
export class SignupComponent {
  password = signal('');
}
```

The toggle button is a real `<button type="button">` with `aria-pressed` and `aria-label` that flips between "Show password" and "Hide password" — the accessibility details teams routinely skip.

### Select

A native `<select>` wrapped for consistent styling, or an ARIA listbox when you need custom option rendering. Start native — it's accessible and keyboard-friendly for free.

```ts
@Component({
  template: `
    <zv-select
      label="Country"
      [options]="countries"
      [(value)]="country" />
  `,
})
export class AddressComponent {
  country = signal<string | null>(null);
  countries = [
    { label: 'India', value: 'IN' },
    { label: 'Fiji', value: 'FJ' },
    { label: 'Vanuatu', value: 'VU' },
  ];
}
```

### Textarea

Textarea with optional auto-grow. Auto-resize is a classic source of layout bugs; centralizing it means one correct implementation instead of forty janky ones.

```ts
<zv-textarea
  label="Message"
  [(value)]="message"
  [autoGrow]="true"
  [maxRows]="8" />
```

## Validation

Validation is where the "works with any forms API" promise is tested. The library never *owns* validation — it **displays** it. This keeps it compatible with all three approaches.

With Reactive Forms, the control surfaces the parent control's errors through `NgControl`:

```ts
form = inject(FormBuilder).group({
  email: ['', [Validators.required, Validators.email]],
});
```

```html
<zv-text-input label="Email" formControlName="email" />
```

`ZvTextInput` reads the injected `NgControl`, watches its status, and renders the matching message from a configurable error map:

```ts
provideZvInputConfig({
  errorMessages: {
    required: 'This field is required',
    email: 'Enter a valid email address',
    minlength: ({ requiredLength }) => `At least ${requiredLength} characters`,
  },
});
```

The control shows errors only when the field is `touched` **and** `invalid` — the convention that produces the least frustrating UX — and wires the error element via `aria-describedby` so assistive tech announces it.

## Signal Forms support

Angular's experimental **Signal Forms** model form state as signals rather than an `AbstractControl` tree. Because `@zellavora/ng-input` is already signals-first, integration is natural:

```ts
import { form, Control } from '@angular/forms/signals'; // experimental

profile = form(signal({ name: '', email: '' }), (p) => {
  required(p.name);
  email(p.email);
});
```

```html
<zv-text-input label="Name" [control]="profile.name" />
<zv-text-input label="Email" [control]="profile.email" />
```

The `[control]` input binds directly to a signal-form field, reading its value and validity reactively. No `ControlValueAccessor` round-trip, no zone.

> Signal Forms are experimental and their API is evolving. Treat this section as directional.

## Reactive Forms support

Covered above — the control implements `ControlValueAccessor`, so `formControlName`, `formControl`, and `ngModel` all "just work." That's the compatibility contract that makes a control library adoptable in an existing codebase without a migration.

## Template-Driven Forms support

Same `ControlValueAccessor`, different binding:

```html
<form #f="ngForm">
  <zv-text-input name="city" [(ngModel)]="city" required />
</form>
```

## Architecture decisions

**Standalone-only.** No `NgModule`. Each control is independently importable, which is what makes tree-shaking effective.

**`model()` over separate input/output.** Using `model()` for `value` gives two-way binding *and* satisfies `ControlValueAccessor` from one source of truth.

**Config via DI, not inputs.** Error messages, appearance defaults, and density are provided through `provideZvInputConfig()` at the app or feature level, so you set conventions once.

**Presentation-only validation.** The library renders errors but never decides them. This is the single decision that keeps it forms-API-agnostic.

**No third-party CSS framework.** Styling uses CSS custom properties (design tokens), so it themes into any design system without a Tailwind/Bootstrap dependency.

## SSR compatibility

Two rules keep the controls SSR-safe:

1. **No DOM at construction.** IDs are generated from a counter/random string, not `document`. Focus, measurement, and auto-grow run inside `afterNextRender()`, which only executes in the browser.
2. **No `window` in field initializers.** Anything platform-specific is guarded with `isPlatformBrowser()` or deferred.

```ts
afterNextRender(() => {
  // safe: browser-only work like measuring scrollHeight for auto-grow
  this.recalcHeight();
});
```

The result: server-rendered HTML matches the client, so there's no hydration mismatch flicker.

## Zoneless support

Because every piece of state is a signal and the controls are `OnPush`, they need no `zone.js` to schedule change detection. Under `provideZonelessChangeDetection()`, updating a signal marks exactly the affected view dirty — nothing else re-renders. This is the performance story in one sentence: **precise, signal-driven updates instead of app-wide zone ticks.**

## Performance benefits

*(Illustrative comparison — directional, not a benchmark of a shipped build.)*

| Scenario | Zone + duplicated inputs | Signals-first `ng-input` (zoneless) |
|---|---|---|
| Change-detection scope on keystroke | Whole component tree | Single bound view |
| Re-renders on a 30-field form | All 30 fields per tick | Only the edited field |
| Bundle cost per unused control | Shipped anyway | Tree-shaken out |

The mechanism behind the table: signal writes propagate only to consumers that actually read the signal, so typing in one field doesn't dirty the other 29.

## Real implementation example

A settings form combining all controls with Reactive Forms:

```ts
@Component({
  selector: 'app-account-settings',
  imports: [ReactiveFormsModule, ZvTextInput, ZvPasswordInput, ZvSelect, ZvTextarea],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()">
      <zv-text-input label="Display name" formControlName="name" />
      <zv-select label="Timezone" [options]="zones" formControlName="tz" />
      <zv-password-input label="New password" formControlName="password" [showStrength]="true" />
      <zv-textarea label="Bio" formControlName="bio" [autoGrow]="true" />
      <button [disabled]="form.invalid">Save</button>
    </form>
  `,
})
export class AccountSettingsComponent {
  private fb = inject(FormBuilder);
  zones = [{ label: 'IST', value: 'Asia/Kolkata' }];
  form = this.fb.group({
    name: ['', Validators.required],
    tz: ['Asia/Kolkata'],
    password: ['', [Validators.required, Validators.minLength(8)]],
    bio: [''],
  });
  save() { if (this.form.valid) { /* submit */ } }
}
```

## Best practices

- **Set conventions once** with `provideZvInputConfig()` — error copy, density, and appearance belong at the app level, not sprinkled per field.
- **Prefer native controls** (`<select>`, `<textarea>`) until you have a concrete reason for a custom ARIA widget. Native is accessible and keyboard-complete for free.
- **Bind labels, never placeholders-as-labels.** A placeholder disappears on focus; a label doesn't.
- **Let the control show errors** — don't build parallel error `@if` blocks in every template.

## Common mistakes

- **Owning validation inside the control.** The moment your input decides validity, it's locked to one forms API. Keep it presentation-only.
- **Touching `document` in a field initializer.** Instant SSR crash. Defer to `afterNextRender()`.
- **Forgetting `setDisabledState`.** Reactive Forms disables via the API, not the attribute; if you ignore it, `form.disable()` silently does nothing.
- **Random IDs that differ between server and client.** Use a deterministic counter or Angular's `inject(APP_ID)` scheme to avoid hydration mismatches.

## Conclusion

Reusable form controls are not a nice-to-have in enterprise Angular — they are where accessibility, design consistency, and validation conventions are enforced or abandoned. `@zellavora/ng-input` shows one coherent way to build them: signals-first for zoneless performance, `ControlValueAccessor` for universal forms-API support, and presentation-only validation so the library never dictates your architecture.

### Roadmap

- Combobox/autocomplete with virtualized options
- Date and number inputs with locale-aware parsing
- First-class Signal Forms bindings as the API stabilizes
- A headless mode that ships behavior without styles

If you build one control library well, every form in your organization gets better at once. That's the leverage.
