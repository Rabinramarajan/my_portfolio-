---
title: "Introducing Zellvora UI: Building an Enterprise Angular Library Ecosystem"
description: "The story and architecture behind Zellvora UI — a signals-first, SSR-safe, zoneless ecosystem of Angular 21 packages for icons, inputs, schema-driven forms, layout, and storage. Why we built it, how it fits together, and where it's going."
tags: ["Angular", "Signals", "Design System", "Enterprise", "Open Source", "Architecture"]
author: "Rabin R"
date: "2026-07-03"
readingTime: "18 min read"
---

> **Note:** Zellvora UI is presented here as a design study and vision piece. Package APIs, project structures, and performance figures are **illustrative** — realistic Angular 21 patterns used to communicate the architecture and intent, not guarantees about a shipped release.

## The problem every enterprise Angular team rediscovers

If you have worked on more than one large Angular application, you have watched the same story play out. A team starts fresh, moves fast, and ships. Six months later there are four different button components, three ways to build a form, two competing layout conventions, an `assets/` folder full of unoptimized SVGs, and a `localStorage` call in a constructor that just broke server-side rendering.

None of this happens because engineers are careless. It happens because the *primitives* — the inputs, forms, layout, icons, and storage that every feature needs — were never treated as shared infrastructure. Each team solved them locally, under deadline, and the solutions drifted.

**Zellvora UI** is an answer to that pattern: a coordinated ecosystem of Angular 21 packages that provide those primitives once, correctly, with a shared architecture. Instead of every team rebuilding the substrate, they build *on* it.

The ecosystem is five packages:

1. **`@zellavora/icons`** — a build-time-optimized, tree-shakeable SVG icon system.
2. **`@zellavora/ng-input`** — signals-first form controls that work with every Angular forms API.
3. **`@zellavora/ng-form`** — schema-driven, dynamic form generation.
4. **`@zellavora/ng-layout`** — grid, responsive, and dashboard layout primitives.
5. **`@zellavora/ng-storage`** — a unified, SSR-safe client-storage layer.

They can be adopted one at a time, but they're designed to compose into something larger than their sum.

## Why the ecosystem was created

Three convictions drove it.

**First, primitives should be shared, not re-invented.** The difference between a coherent product and a patchwork one is whether the fundamental pieces are consistent. Consistency is far easier to *provide* than to *police*. A shared library makes the consistent path the easy path.

**Second, Angular 21 changed what "well-built" means.** Signals, zoneless change detection, standalone components, `resource()`, and the maturing Signal Forms are not incremental — they change the *right* way to build a control or a layout. Most existing libraries were designed for the `NgModule` + `zone.js` + RxJS-everywhere era. Building fresh on the new primitives yields something meaningfully faster and simpler.

**Third, SSR and performance are now table stakes.** Enterprise apps render on the server for speed and SEO, run zoneless for responsiveness, and are measured on Core Web Vitals. A primitive that isn't SSR-safe or drags in `zone.js` overhead is a liability. These constraints had to be designed in, not bolted on.

## The problems it solves

Mapping each package to the concrete pain it removes:

| Package | The pain it removes |
|---|---|
| `@zellavora/icons` | Bloated bundles from shipping all icons; unoptimized SVGs; inaccessible icon buttons; design/code drift |
| `@zellavora/ng-input` | Forty duplicated inputs; accessibility drift; lock-in to one forms API |
| `@zellavora/ng-form` | Hand-built dynamic forms; scattered conditional logic; forms that can't change without a release |
| `@zellavora/ng-layout` | Inconsistent page shells; re-invented dashboards; SSR-breaking layout code |
| `@zellavora/ng-storage` | Manual serialization; SSR crashes on `localStorage`; no versioning; no cross-tab sync |

Individually, each is a real win. Together, they cover the substrate of an enterprise app.

## Architecture decisions

The ecosystem is opinionated, and the opinions are shared across all five packages. That consistency is itself a feature — learn one package's conventions and you know all of them.

### 1. Signals-first, everywhere

Every stateful primitive models its state as signals. An input's `value`, a form field's validity, a layout's sidebar state, a storage key's value — all signals. This isn't fashion; it's what enables precise change detection and zoneless operation. A signal write updates exactly the views that read it, and nothing else.

### 2. Standalone-only, tree-shakeable

No `NgModule` anywhere. Every component and function is independently importable and side-effect-free, so bundlers drop what you don't use. Importing one icon ships one icon; importing one control ships one control.

### 3. `ControlValueAccessor` as a universal contract

The forms packages implement `ControlValueAccessor`, so a control works with Reactive, Template-Driven, **and** Signal Forms without per-consumer glue. The library never forces a forms API on you.

### 4. Presentation and behavior, not policy

Controls display validation; they don't own it. The storage layer persists values; it doesn't decide trust. The layout renders structure; it doesn't dictate domain logic. Keeping libraries policy-free is what keeps them broadly adoptable.

### 5. Tokens over hard-coded styles

All visual values — spacing, color, radius, breakpoints — are CSS custom properties. The ecosystem themes into *your* design system rather than imposing one, and carries no CSS-framework dependency.

### 6. SSR and zoneless as invariants

No package accesses `window`/`document` at construction. Browser-only work is deferred to `afterNextRender()` or guarded by `isPlatformBrowser()`. Every component is `OnPush`. These aren't per-package choices; they're ecosystem invariants enforced in review.

## Angular 21 innovations, put to work

The ecosystem is a showcase of what the modern framework enables:

- **Signals** (`signal`, `computed`, `effect`, `model`) for all state and derivation.
- **`model()`** for two-way-bindable inputs that *also* satisfy `ControlValueAccessor` from one source of truth.
- **Zoneless change detection** (`provideZonelessChangeDetection`) — no `zone.js` in the critical path.
- **`resource()` / `httpResource()`** for SSR-aware async data (schema fetches in `ng-form`, cached data in `ng-storage`).
- **`afterNextRender()`** for SSR-safe DOM work (auto-grow textareas, breakpoint observation).
- **Signal Forms** (experimental) as a first-class integration target for `ng-input` and `ng-form`.
- **`@defer`** for lazy layout sections and off-screen form groups.
- **Standalone + `input()`/`output()`** functional component APIs throughout.

## Signals-first design in practice

To make "signals-first" concrete, here's the same idea expressed across three packages — one mental model, applied everywhere.

An input's value:

```ts
readonly value = model<string>(''); // two-way + CVA
```

A form field's validity:

```ts
readonly valid = computed(() => this.errors() === null);
```

A layout's split ratio:

```ts
readonly ratio = model(0.5);
readonly leftStyle = computed(() => ({ 'flex-basis': `${this.ratio() * 100}%` }));
```

A persisted preference:

```ts
sidebarOpen = storageSignal('dash.sidebar', true, { syncTabs: true });
```

Four packages, one pattern: **state is a signal, derivation is `computed`, persistence and two-way binding are just signals with extra behavior.** Once a developer internalizes it in one package, every other package feels familiar.

## SSR support, by construction

Server rendering is where naive libraries fail, so it's designed in at every layer:

- **`@zellavora/icons`** renders inline `<svg>` from static build-time data — present in the initial HTML, no fetch, no flash.
- **`@zellavora/ng-input`** generates deterministic IDs and defers focus/measurement to `afterNextRender()` — no hydration mismatch.
- **`@zellavora/ng-form`** renders deterministically from schema + model and fetches schemas via `resource()` with state transfer.
- **`@zellavora/ng-layout`** drives responsiveness through CSS media queries, not DOM measurement, so the server emits correct responsive HTML.
- **`@zellavora/ng-storage`** guards every backend behind `isPlatformBrowser()`, returns defaults on the server, and reads cookies from the request for server-known values.

The shared rule: **given the same inputs, server and client produce identical DOM.** That's what makes hydration seamless.

## Zoneless architecture

Running zoneless (`provideZonelessChangeDetection()`) is the ecosystem's default assumption. Because every component is `OnPush` and every piece of state is a signal, change detection is driven entirely by signal reads and writes. There is no `zone.js` monkey-patching timers and events to trigger app-wide checks.

The practical effect on a dense enterprise screen — say a 40-field form inside a dashboard shell — is that typing in one field updates that one field's view, editing the sidebar toggles one attribute, and nothing re-checks the other 39 fields or the rest of the tree. Work scales with *what changed*, not with *how big the app is*.

## Tree shaking

Every export is standalone and side-effect-free, so your bundle contains only what you import:

```ts
// Ships: one icon, one control, the grid — nothing else from the ecosystem.
import { search } from '@zellavora/icons';
import { ZvTextInput } from '@zellavora/ng-input';
import { ZvGrid } from '@zellavora/ng-layout';
```

*(Illustrative — directional, not a benchmark of a shipped build.)*

| Usage | Naive/monolithic lib | Zellvora UI (tree-shaken) |
|---|---|---|
| 12 of 200 icons | All 200 | 12 |
| 3 of 20 controls | Whole module | 3 |
| Grid only, no dashboard | Entire layout module | Grid primitive only |

## Developer experience

Adoption lives and dies on ergonomics, so DX is a first-class goal:

- **One mental model** across all five packages (the signals pattern above).
- **Copy-paste-ready examples** in every package's docs, using real Angular 21 APIs.
- **Typed everything** — schemas, icon defs, storage options — with inference.
- **Lint rules** that catch the footguns (`import *` from icons, storage access in constructors).
- **A demo playground** rendering every control, field type, layout, and storage backend for manual verification.
- **Incremental adoption** — start with one package in one component; no big-bang migration.

## Project structure

A typical enterprise app built on the ecosystem organizes cleanly. The ecosystem packages live in `node_modules` (or an internal registry); your app composes them:

```
src/app/
├── core/                # app-wide singletons & providers
│   ├── config/          # provideZv*Config() calls (icons, inputs, storage)
│   └── guards/
├── shared/              # your thin wrappers over Zellvora primitives
│   ├── ui/              # e.g. AppButton composed from @zellavora/icons + tokens
│   └── forms/           # app-specific field types registered into ng-form
├── features/            # domain features (lazy-loaded)
│   ├── dashboard/       # uses @zellavora/ng-layout dashboard shell
│   ├── onboarding/      # uses @zellavora/ng-form schema forms
│   └── settings/        # uses @zellavora/ng-input + ng-storage
└── ui/                  # design tokens (CSS custom properties)
    └── tokens.css       # spacing, color, radius, breakpoints
```

The key architectural move: **`ui/tokens.css` is the single styling source of truth.** All five packages consume those custom properties, so one token change restyles icons, inputs, forms, and layout together.

## Real-world examples

### A settings screen (three packages)

```ts
@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, ZvTextInput, ZvSelect, ZvIcon],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()">
      <zv-text-input label="Display name" formControlName="name" />
      <zv-select label="Theme" [options]="themes" formControlName="theme" />
      <button><zv-icon [icon]="save" /> Save</button>
    </form>
  `,
})
export class SettingsComponent {
  private fb = inject(FormBuilder);
  protected readonly save = saveIcon; // @zellavora/icons
  themes = [{ label: 'Dark', value: 'dark' }, { label: 'Light', value: 'light' }];

  // @zellavora/ng-storage: remembers the theme across sessions & tabs
  private themePref = storageSignal('theme', 'dark', { syncTabs: true });

  form = this.fb.group({
    name: ['', Validators.required],
    theme: [this.themePref()],
  });

  save() {
    if (this.form.valid) this.themePref.set(this.form.value.theme!);
  }
}
```

### An API-driven onboarding flow (four packages)

```ts
@Component({
  selector: 'app-onboarding',
  imports: [ZvDashboard, ZvForm, ZvIcon],
  template: `
    <zv-dashboard [(sidebarOpen)]="sidebarOpen">
      <zv-dashboard-content>
        @if (schema(); as s) {
          <zv-form [schema]="s" [(model)]="model" (submitted)="finish($event)" />
        } @else {
          <zv-form-skeleton [fields]="6" />
        }
      </zv-dashboard-content>
    </zv-dashboard>
  `,
})
export class OnboardingComponent {
  private api = inject(OnboardingApi);
  // ng-layout + ng-storage
  sidebarOpen = storageSignal('dash.sidebar', true);
  // ng-form + resource() (SSR-aware)
  model = signal({});
  schema = resource({ loader: () => this.api.schema('onboarding-v2') }).value;
  finish(v: unknown) { this.api.complete(v); }
}
```

Four packages, one coherent screen, one styling source of truth — and every piece SSR-safe and zoneless.

## Benefits, summarized

**Faster development.** Teams stop rebuilding inputs, forms, layout, icons, and storage. A new screen composes existing primitives instead of re-solving solved problems.

**Consistent UI.** Shared tokens and components mean the product looks like one product. Accessibility and responsiveness are inherited, not re-implemented.

**Better performance.** Signals-first + zoneless means change detection scales with what changed. Tree-shaking keeps bundles lean. SSR-safety keeps Core Web Vitals healthy.

**Reusable architecture.** One mental model, one set of conventions, one place to fix a bug for everyone. The substrate improves for the whole organization at once.

## Installation

Adopt incrementally — install only what you need:

```bash
# Start with one
npm install @zellavora/ng-input

# Or the whole ecosystem
npm install @zellavora/icons @zellavora/ng-input @zellavora/ng-form \
            @zellavora/ng-layout @zellavora/ng-storage
```

Then wire shared configuration once, in `core/`:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideZvIconConfig({ defaultSize: 20 }),
    provideZvInputConfig({ errorMessages }),
    provideZvFieldTypes({ /* custom field types */ }),
  ],
};
```

## Roadmap

Near-term, per package:

- **icons** — a hosted icon browser and figma-sync plugin.
- **ng-input** — combobox/autocomplete, locale-aware date and number inputs.
- **ng-form** — a visual schema builder, wizard/stepper schemas, JSON Schema interop.
- **ng-layout** — draggable dashboard grids, container queries, density modes.
- **ng-storage** — encrypted IndexedDB stores, richer migration tooling.

## Future packages

The ecosystem is intended to grow along the same architectural spine:

- **`@zellavora/ng-table`** — a signals-first, virtualized data grid.
- **`@zellavora/ng-overlay`** — dialogs, popovers, and toasts with SSR-safe portals.
- **`@zellavora/ng-charts`** — accessible, themeable data visualization on the shared token system.
- **`@zellavora/ng-i18n`** — signal-driven localization utilities.

Each future package would inherit the same invariants: signals-first, standalone, tree-shakeable, SSR-safe, zoneless, token-themed.

## Open-source vision

Infrastructure this fundamental is most valuable in the open. The vision for Zellvora UI is a genuinely open ecosystem: public source, a transparent roadmap, semantic-versioned releases, and a contribution process where adding an icon, a field type, or a layout primitive is a well-documented pull request. Enterprises get audited, consistent primitives; the community gets a modern, signals-first reference for how Angular 21 libraries should be built; and the whole thing improves faster than any single team could manage alone.

The measure of success is simple: teams stop writing the substrate and start building products.

## Conclusion

Every enterprise Angular team rediscovers the same truth the hard way — that inputs, forms, layout, icons, and storage are shared infrastructure, and treating them as local problems produces inconsistency, bloat, and bugs. Zellvora UI is a bet that the substrate should be built once, on Angular 21's modern primitives, with signals-first, SSR-safe, zoneless architecture as non-negotiable invariants. Five packages, one mental model, one styling source of truth — composable into applications that are faster to build, more consistent, and better performing.

**Join the Zellvora ecosystem.**
