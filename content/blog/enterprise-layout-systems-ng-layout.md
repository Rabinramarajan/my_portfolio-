---
title: "Creating Enterprise Layout Systems with @zellavora/ng-layout"
description: "For Angular architects: designing a signals-based, SSR-safe, zoneless layout system — grid primitives, responsive layouts, dashboard shells, and how signal-driven layouts differ from traditional ones."
tags: ["Angular", "Signals", "Layout", "Architecture", "SSR"]
author: "Rabin R"
date: "2026-07-03"
readingTime: "12 min read"
---

> **Note:** `@zellavora/ng-layout` is a design study. APIs, diagrams, and benchmark figures are **illustrative** — realistic Angular 21 patterns used to explain the architecture, not a shipped release.

## Why layout consistency matters

Layout is the substrate everything else sits on, which is exactly why inconsistency in it is so corrosive. When every team invents its own page shell, gutters, and breakpoints, three things happen: the product looks subtly incoherent, responsive bugs multiply, and every new screen re-litigates decisions that should have been made once.

For an architect, a layout system is a governance tool. It encodes the spacing scale, the breakpoints, the container widths, and the dashboard chrome as **components and tokens**, so consistency is the path of least resistance rather than a code-review battle.

## Enterprise UI challenges

Enterprise UIs have specific layout pressures that consumer apps often don't:

- **Density and information volume.** Dashboards pack dozens of widgets; the layout must handle overflow, resizing, and reflow gracefully.
- **Persistent chrome.** A collapsible sidebar, a top bar, breadcrumbs, and a content area that must scroll independently — replicated across hundreds of routes.
- **Multi-breakpoint reality.** The same screen runs on a 4K analyst monitor and a field technician's tablet.
- **RTL and localization.** Layouts must mirror; hard-coded `left`/`right` becomes technical debt.
- **SSR and performance.** Enterprise apps increasingly render on the server for speed and SEO, so layout must be deterministic and hydration-safe.

A layout library that ignores any of these fails in production.

## Design philosophy behind @zellavora/ng-layout

Three principles:

**1. Tokens before components.** Spacing, breakpoints, and container widths are CSS custom properties. Components consume tokens; changing a token restyles the system.

**2. Signals for layout *state*, CSS for layout *rendering*.** Static positioning belongs in CSS Grid/Flexbox — it's fast and SSR-trivial. Only *stateful* layout (sidebar collapsed? current breakpoint? which panel is active?) is modeled with signals. Using signals for what CSS already does well is an anti-pattern; using them for interactive layout state is exactly right.

**3. SSR and zoneless as constraints, not features.** Every component is authored to render identically on server and client and to update without `zone.js`.

```bash
npm install @zellavora/ng-layout
```

## Grid system

The grid is a thin, token-driven wrapper over CSS Grid — not a JS layout engine. This is deliberate: CSS Grid is already the fastest, most SSR-friendly layout primitive available.

```html
<zv-grid [cols]="12" gap="4">
  <zv-col span="8" [spanMd]="12">Main</zv-col>
  <zv-col span="4" [spanMd]="12">Aside</zv-col>
</zv-grid>
```

This compiles to real CSS Grid with custom properties:

```scss
.zv-grid {
  display: grid;
  grid-template-columns: repeat(var(--zv-cols, 12), minmax(0, 1fr));
  gap: calc(var(--zv-space-unit) * var(--zv-gap, 4));
}
```

The responsive `spanMd`/`spanLg` inputs set custom properties that media queries consume — so the responsiveness is **pure CSS**, evaluated by the browser, with zero JS on resize.

## Responsive layouts

The system exposes breakpoints two ways.

**Declaratively (preferred)** — responsive inputs, resolved by CSS:

```html
<zv-stack direction="row" [directionMd]="'column'" gap="3">
  <div>A</div><div>B</div>
</zv-stack>
```

**Reactively (when you need the value in TS)** — a signal-based breakpoint service for cases where layout *logic* (not just style) depends on size, e.g. "render a table on desktop, cards on mobile":

```ts
export class ZvBreakpoint {
  // Signal that tracks the active breakpoint, SSR-safe
  readonly current = signal<'sm' | 'md' | 'lg' | 'xl'>('lg');
  readonly isMobile = computed(() => this.current() === 'sm');
}
```

```ts
@Component({
  template: `
    @if (bp.isMobile()) { <app-card-list /> } @else { <app-data-table /> }
  `,
})
export class ReportComponent {
  protected bp = inject(ZvBreakpoint);
}
```

The distinction matters: use CSS for *appearance* responsiveness, use the signal only when the *component structure* itself must change.

## Dashboard layouts

The dashboard shell is the highest-value component — the thing every enterprise app rebuilds. It provides a header, a collapsible sidebar, and an independently-scrolling content area, all with SSR-safe, signal-driven state.

```html
<zv-dashboard [(sidebarOpen)]="sidebarOpen">
  <zv-dashboard-header>
    <button (click)="sidebarOpen.set(!sidebarOpen())" aria-label="Toggle sidebar">☰</button>
  </zv-dashboard-header>

  <zv-dashboard-sidebar>
    <nav aria-label="Primary"><!-- nav items --></nav>
  </zv-dashboard-sidebar>

  <zv-dashboard-content>
    <router-outlet />
  </zv-dashboard-content>
</zv-dashboard>
```

```ts
export class DashboardPage {
  sidebarOpen = signal(true);
}
```

The collapse state is a `model()` signal, so it's two-way bindable and persistable (drop it into `@zellavora/ng-storage` to remember the user's preference across sessions).

### Architecture diagram

```
┌──────────────────────────────────────────────────────────┐
│  <zv-dashboard>                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │  <zv-dashboard-header>   (sticky, top bar)          │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌───────────────┐ ┌────────────────────────────────────┐│
│  │ sidebar        │ │  <zv-dashboard-content>            ││
│  │ (signal:       │ │  ┌──────────────────────────────┐ ││
│  │  sidebarOpen)  │ │  │  independently scrolling      │ ││
│  │  collapsible   │ │  │  <router-outlet/>             │ ││
│  │  CSS width via │ │  │                               │ ││
│  │  data-attr     │ │  └──────────────────────────────┘ ││
│  └───────────────┘ └────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
   state: signals   │   rendering: CSS Grid + custom props
```

The sidebar width animates via CSS transitions on a `data-open` attribute the signal toggles — the browser handles the animation, not JS.

## SSR compatibility

Layout is where SSR most often breaks, because layout code loves to measure the DOM. `@zellavora/ng-layout` avoids it:

- **No `getBoundingClientRect()` at init.** Breakpoint detection uses `matchMedia` guarded by `isPlatformBrowser()`, with a sensible default breakpoint for the server render.
- **CSS-driven responsiveness.** Because spans and stacks resolve through media queries, the server emits correct responsive HTML without knowing the viewport.
- **Deterministic chrome.** The dashboard renders with `sidebarOpen`'s initial value on both server and client, so hydration matches.

```ts
constructor() {
  if (isPlatformBrowser(this.platformId)) {
    afterNextRender(() => this.observeBreakpoints());
  }
}
```

## Zoneless rendering

Every layout component is `OnPush` with signal state, so it runs cleanly under `provideZonelessChangeDetection()`. Toggling the sidebar updates exactly one `data-open` attribute binding; changing the breakpoint updates only the views that read `bp.current()`. There is no resize handler forcing global change detection — the classic zone-based layout performance killer.

## Signal-based components

What does "signal-based layout" actually buy you? Consider a resizable split panel:

```ts
export class ZvSplitPane {
  readonly ratio = model(0.5); // 0..1, two-way bindable

  protected readonly leftStyle = computed(() => ({
    'flex-basis': `${this.ratio() * 100}%`,
  }));

  protected onDrag(fraction: number) {
    this.ratio.set(Math.min(0.9, Math.max(0.1, fraction)));
  }
}
```

Dragging updates one signal; the `computed` style recalculates; only this component re-renders. In a zone-based implementation, a `mousemove` handler would trip change detection across the whole app on every pixel of drag.

## Traditional layouts vs. signal-based layouts

| Concern | Traditional (zone + component state) | `@zellavora/ng-layout` (signals) |
|---|---|---|
| Sidebar toggle | Property + zone tick re-checks tree | Signal → one attribute binding updates |
| Resize/drag | `mousemove` → app-wide change detection | Signal write → only this component |
| Breakpoint logic | `window.resize` subscription in every component | One shared breakpoint signal |
| SSR | Often measures DOM → hydration mismatch | CSS-driven, deterministic |
| Bundle | Monolithic layout module | Standalone, tree-shaken primitives |

The through-line: **traditional layouts re-check too much; signal layouts update exactly what changed.**

## Performance benchmarks

*(Illustrative and directional — not measurements of a shipped build.)*

| Scenario | Zone-based layout | Signal-based `ng-layout` |
|---|---|---|
| Sidebar toggle | Whole-tree CD pass | Single binding update |
| Split-pane drag (per frame) | App-wide CD each `mousemove` | One component's `computed` |
| Breakpoint change | Every subscribed component reacts | Only views reading the signal |
| Server render of dashboard shell | Risk of hydration mismatch | Deterministic, matches client |

The point of the table is the *shape* of the difference, not exact milliseconds: signal layouts convert O(tree) work into O(affected-views) work.

## Best practices

- **Tokenize first.** Define your spacing scale, breakpoints, and container widths as custom properties before building screens. Everything downstream inherits them.
- **CSS for appearance, signals for logic.** If a media query can do it, don't reach for a signal. Reserve signals for state that changes component *structure* or persists.
- **Persist layout preferences.** Sidebar state, split ratios, and density are user preferences — store them.
- **Design RTL-safe.** Use logical properties (`margin-inline-start`, not `margin-left`) so mirroring is free.
- **Keep the dashboard shell dumb.** It should own chrome and layout state, nothing domain-specific.

## Common mistakes

- **Measuring the DOM to decide layout.** It breaks SSR and thrashes performance. Prefer CSS and `matchMedia`.
- **A `window.resize` listener per component.** Centralize in one breakpoint signal.
- **Signals for static structure.** A three-column grid that never changes doesn't need a signal — it needs CSS Grid.
- **Hard-coded `left`/`right`.** Guarantees an RTL rewrite later.

## Conclusion

A layout system is architecture, not decoration: it's where consistency, responsiveness, RTL, SSR-safety, and performance are decided once for the whole product. `@zellavora/ng-layout` argues for a disciplined split — CSS Grid and tokens for rendering, signals only for interactive and persisted layout state — which yields shells that are fast, zoneless, and server-safe by construction.

### Roadmap

- **Draggable dashboard grids** with persisted widget positions
- **Container queries** for component-level responsiveness beyond viewport breakpoints
- **Layout schema** shared with `@zellavora/ng-form` for fully declarative pages
- **Density modes** (comfortable/compact) as a first-class token set
- **Masonry and virtualized grid** primitives for large data surfaces

Get the substrate right, and every screen built on top of it starts consistent.
