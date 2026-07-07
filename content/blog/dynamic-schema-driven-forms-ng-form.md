---
title: "How We Built Dynamic Schema-Driven Forms with @zellavora/ng-form"
description: "An enterprise deep dive into schema-driven forms for Angular 21+ — dynamic field generation, a signals-based validation engine, conditional fields, custom components, API-driven forms, and SSR-safe, zoneless rendering."
tags: ["Angular", "Signals", "Schema-Driven Forms", "Enterprise", "Architecture"]
author: "Rabin R"
date: "2026-07-03"
readingTime: "14 min read"
---

> **Note:** `@zellavora/ng-form` is presented as a design study. APIs, schema shapes, and performance figures are **illustrative** — idiomatic Angular 21 patterns used to explain the architecture, not a shipped release.

## What are schema-driven forms?

A schema-driven form is a form you **describe as data** rather than build as markup. Instead of hand-writing every field, label, validator, and conditional in a template, you declare a JSON (or TypeScript) schema, and a rendering engine turns it into a live, validated Angular form at runtime.

```json
{
  "fields": [
    { "type": "text", "name": "firstName", "label": "First name", "validators": ["required"] },
    { "type": "email", "name": "email", "label": "Email", "validators": ["required", "email"] }
  ]
}
```

That schema renders a two-field form with validation — no template edits. Change the schema, change the form.

## Why enterprise applications need them

The case for schema-driven forms is weakest in small apps and overwhelming in large ones. Here's why enterprises reach for them:

**Forms outlive their authors.** A bank's KYC form changes when regulations change — often by a compliance analyst, not a frontend engineer. If the form is data, it can be edited, versioned, and reviewed without a frontend release.

**The same form renders in many contexts.** A product's "create ticket" form appears in the web app, an admin console, and an embedded widget. One schema, three render targets, zero duplication.

**Forms are configured per tenant.** Multi-tenant SaaS routinely needs Customer A to collect a field Customer B doesn't. Branching your codebase per tenant is madness; branching a schema is trivial.

**Forms are generated from other systems.** A backend already knows a resource's fields and constraints. Emitting a form schema from that source of truth eliminates the frontend re-declaring the same rules.

## Challenges with traditional forms

Traditional Angular forms — Reactive or Template-Driven — are excellent for *fixed* forms. They struggle with *dynamic* ones:

- **Templates can't be data.** A `FormGroup` built in TypeScript still needs a template that knows each control's name. Truly dynamic fields force `*ngFor`-over-controls gymnastics that get unreadable fast.
- **Conditional logic sprawls.** "Show field B only when A === 'yes'" ends up as `@if` conditions scattered across the template and `valueChanges` subscriptions scattered across the component.
- **Cross-field validation is awkward.** Validators that depend on other fields require group-level validators wired by hand.
- **No single source of truth.** The form's shape lives in three places: the `FormGroup`, the template, and the submit handler. They drift.

Schema-driven forms collapse all three into one artifact.

## Design goals of @zellavora/ng-form

- **Schema is the single source of truth.** Fields, validation, layout, and conditions all live in one declarative object.
- **Signals-first engine.** Form state, per-field validity, and derived visibility are signals — precise updates, zoneless-ready.
- **Pluggable field registry.** Any Angular component can be a field type. The library ships common ones; you register your own.
- **Validation as a first-class engine**, not scattered validators — declarative, composable, and async-aware.
- **SSR-safe and zoneless** by construction.
- **Type-safe where it counts.** Schemas are authorable in TypeScript with inference, or loaded as JSON from an API.

```bash
npm install @zellavora/ng-form
```

## Dynamic field generation

The core is a single renderer that takes a schema and produces the form:

```ts
@Component({
  selector: 'app-dynamic',
  imports: [ZvForm],
  template: `
    <zv-form
      [schema]="schema"
      [(model)]="model"
      (submitted)="onSubmit($event)" />
  `,
})
export class DynamicComponent {
  model = signal<Record<string, unknown>>({});
  schema: ZvFormSchema = {
    fields: [
      { type: 'text',   name: 'company', label: 'Company', validators: ['required'] },
      { type: 'select', name: 'plan',    label: 'Plan', options: [
        { label: 'Starter', value: 'starter' },
        { label: 'Enterprise', value: 'enterprise' },
      ]},
      { type: 'number', name: 'seats',   label: 'Seats', validators: ['required', { min: 1 }] },
    ],
  };
  onSubmit(value: Record<string, unknown>) { /* ... */ }
}
```

Under the hood, `ZvForm` builds a signal-backed model and resolves each field's `type` against a **field registry**:

```ts
export const ZV_FIELD_REGISTRY = new InjectionToken<FieldRegistry>('zv-fields');

provideZvFieldTypes({
  text: ZvTextField,
  email: ZvTextField,
  number: ZvNumberField,
  select: ZvSelectField,
  textarea: ZvTextareaField,
});
```

Each registered component receives a `ZvFieldContext` — the field's signal value, validity, and metadata — and renders itself. This is what makes the system open: adding a field type is registering a component, not editing the engine.

## Validation engine

Validation is declarative and lives in the schema. The engine compiles validator descriptors into signal-derived validity:

```json
{
  "type": "text",
  "name": "username",
  "label": "Username",
  "validators": [
    "required",
    { "minLength": 3 },
    { "pattern": "^[a-z0-9_]+$" },
    { "async": "uniqueUsername" }
  ]
}
```

Built-in validators (`required`, `minLength`, `pattern`, `min`, `max`, `email`) resolve synchronously. Named async validators (`uniqueUsername`) resolve against injected providers:

```ts
provideZvAsyncValidators({
  uniqueUsername: (value: string) =>
    inject(UserApi).checkUsername(value).pipe(map(ok => ok ? null : { taken: true })),
});
```

Internally each field exposes a computed validity signal:

```ts
readonly errors = computed<ValidationErrors | null>(() => {
  const value = this.value();
  for (const v of this.syncValidators) {
    const err = v(value);
    if (err) return err;
  }
  return this.asyncState(); // resolved async errors, also a signal
});

readonly valid = computed(() => this.errors() === null);
```

The whole-form validity is just a `computed` over field signals — no manual status plumbing:

```ts
readonly formValid = computed(() =>
  this.fields().every(f => f.valid())
);
```

## Conditional fields

Conditions are declared in the schema and evaluated reactively. A field's visibility is a `computed` over the model — change a value, dependent fields appear or vanish with no subscriptions:

```json
{
  "type": "select",
  "name": "hasVat",
  "label": "VAT registered?",
  "options": [{ "label": "Yes", "value": true }, { "label": "No", "value": false }]
},
{
  "type": "text",
  "name": "vatNumber",
  "label": "VAT number",
  "visibleWhen": { "field": "hasVat", "equals": true },
  "validators": ["required"]
}
```

The engine compiles `visibleWhen` into a predicate:

```ts
readonly visible = computed(() => {
  const cond = this.field.visibleWhen;
  if (!cond) return true;
  return this.model()[cond.field] === cond.equals;
});
```

Crucially, **hidden fields are excluded from validation** — a required `vatNumber` doesn't block submission when it isn't shown. That single rule eliminates a whole class of "why is my form invalid" bugs.

## Custom components

When a field needs a bespoke UI — a map picker, a signature pad, a currency input — you register a component and reference it by type:

```ts
provideZvFieldTypes({ signature: SignaturePadField });
```

```ts
@Component({ selector: 'app-signature-field', /* ... */ })
export class SignaturePadField {
  readonly ctx = inject(ZV_FIELD_CONTEXT); // { value, setValue, errors, meta }
  save(dataUrl: string) { this.ctx.setValue(dataUrl); }
}
```

```json
{ "type": "signature", "name": "consent", "label": "Sign here", "validators": ["required"] }
```

The engine doesn't know or care what a signature pad is — it delegates to the registered component through a stable context contract.

## API-driven forms

The payoff for enterprises: fetch the schema from a backend and render it. The form's definition becomes a runtime concern, editable without shipping frontend code.

```ts
@Component({
  template: `
    @if (schema(); as s) {
      <zv-form [schema]="s" [(model)]="model" (submitted)="submit($event)" />
    } @else {
      <zv-form-skeleton [fields]="6" />
    }
  `,
})
export class ApiFormComponent {
  private api = inject(FormApi);
  model = signal({});
  // resource() ties an async fetch to a signal, SSR-aware
  schema = resource({ loader: () => this.api.getSchema('kyc-v3') }).value;
  submit(v: unknown) { this.api.submit('kyc-v3', v); }
}
```

Because the schema is data, you get versioning (`kyc-v3`), A/B testing, and per-tenant overrides essentially for free.

## Signal Forms integration

Angular's experimental **Signal Forms** are a natural backend for the engine. Rather than maintaining a bespoke model, `ZvForm` can project the schema onto a signal form:

```ts
// Conceptual: schema compiles to a signal form definition
const model = signal(initialValueFromSchema(schema));
const f = form(model, (root) => applySchemaRules(root, schema));
```

Each field then binds to `f[fieldName]`, inheriting validity and value tracking from Angular's own signal-forms primitives. As that API stabilizes, the engine's custom validity layer can defer to it.

> Signal Forms are experimental; this integration is directional.

## SSR support

Two guarantees keep schema-driven forms SSR-safe:

1. **Deterministic rendering.** Given the same schema and model, server and client produce identical DOM. Field IDs are derived from field names, not random values, so hydration matches.
2. **`resource()` for schema fetches.** Using Angular's `resource()`/`httpResource()` means the schema fetch participates in server-side rendering and transfers state to the client — no double fetch, no flash of empty form.

Conditional visibility is a pure `computed`, so it evaluates identically on server and client for the same model.

## Zoneless architecture

The engine holds **no** `zone.js` assumptions. Field values, validity, and visibility are signals; the renderer components are `OnPush`. Under `provideZonelessChangeDetection()`:

- Editing one field updates only that field's view and any `computed`s that read it (e.g. a dependent field's visibility).
- Nothing schedules an app-wide change-detection tick.

This is what lets a 60-field schema-driven form stay responsive while typing.

## Performance optimization techniques

*(Illustrative — directional guidance, not shipped benchmarks.)*

| Technique | Why it helps |
|---|---|
| `@defer` off-screen field groups | Long multi-section forms don't build every field up front |
| `computed` visibility (no `valueChanges`) | Zero subscriptions; updates are pull-based and memoized |
| Field registry + tree-shaking | Only the field types you register ship in the bundle |
| Skeleton while schema loads | Perceived performance for API-driven forms |
| Debounced async validators | One network call per pause, not per keystroke |

Two rules of thumb: **derive, don't subscribe** (prefer `computed` over `valueChanges`), and **defer what's off-screen**.

## Full example: a conditional, API-driven onboarding form

```json
{
  "id": "onboarding-v2",
  "fields": [
    { "type": "text",   "name": "orgName", "label": "Organization", "validators": ["required"] },
    { "type": "select", "name": "orgType", "label": "Type", "validators": ["required"],
      "options": [
        { "label": "Company", "value": "company" },
        { "label": "Individual", "value": "individual" }
      ]
    },
    { "type": "text", "name": "registrationNo", "label": "Registration number",
      "visibleWhen": { "field": "orgType", "equals": "company" },
      "validators": ["required"] },
    { "type": "number", "name": "teamSize", "label": "Team size",
      "visibleWhen": { "field": "orgType", "equals": "company" },
      "validators": ["required", { "min": 1 }] },
    { "type": "email", "name": "contactEmail", "label": "Contact email",
      "validators": ["required", "email", { "async": "uniqueEmail" }] }
  ]
}
```

```ts
@Component({
  imports: [ZvForm],
  template: `
    @if (schema(); as s) {
      <zv-form [schema]="s" [(model)]="model" (submitted)="finish($event)" />
    }
  `,
})
export class OnboardingComponent {
  private api = inject(OnboardingApi);
  model = signal({ orgType: 'individual' });
  schema = resource({ loader: () => this.api.schema('onboarding-v2') }).value;
  finish(value: unknown) { this.api.complete(value); }
}
```

Selecting "Company" reveals `registrationNo` and `teamSize`, both required — but only while visible. Switching back to "Individual" hides and un-validates them. Zero template edits, zero subscriptions.

## Future improvements

- **Visual schema builder** — a drag-and-drop UI that emits `ng-form` schemas.
- **Layout schema** — declarative grid/section/step layout alongside fields (integrating with `@zellavora/ng-layout`).
- **Wizard/stepper support** — multi-page schemas with per-step validation gates.
- **JSON Schema interop** — import standard JSON Schema and map constraints to validators.
- **Offline drafts** — autosave in-progress models via `@zellavora/ng-storage`.

## GitHub contribution guide

If this were an open-source package, contributing would look like:

1. **Fork and clone**, then `pnpm install` and `pnpm build`.
2. **Run the demo playground** (`pnpm start`) — it renders every field type and condition for manual testing.
3. **Add a field type** by creating a component that injects `ZV_FIELD_CONTEXT` and registering it in the demo's `provideZvFieldTypes`.
4. **Write tests** — every field type needs value, validity, and SSR-render coverage.
5. **Follow the commit convention** (`feat:`, `fix:`, `docs:`) — the changelog is generated from it.
6. **Open a PR** against `main` with a demo screenshot or schema snippet showing the behavior.

Good first issues: new built-in validators, additional field types, and docs examples.

## Conclusion

Schema-driven forms trade a little upfront engine complexity for enormous downstream leverage: forms become data you can version, fetch, configure per tenant, and edit without a frontend release. `@zellavora/ng-form` shows how a signals-first engine makes that both performant (precise, zoneless updates) and safe (SSR-deterministic, hidden fields excluded from validation). For any organization where forms change faster than release cycles, that leverage is the whole game.
