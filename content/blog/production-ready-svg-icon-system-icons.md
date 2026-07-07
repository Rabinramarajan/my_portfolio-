---
title: "Building a Production-Ready SVG Icon System with @zellavora/icons"
description: "How to design an Angular icon system that optimizes SVGs, auto-syncs via a build pipeline, tree-shakes to only the icons you use, renders SSR-safely, and stays accessible."
tags: ["Angular", "SVG", "Icons", "Build Tooling", "Accessibility", "Performance"]
author: "Rabin R"
date: "2026-07-03"
readingTime: "10 min read"
---

> **Note:** `@zellavora/icons` is a design study. APIs, metrics, and pipeline details are **illustrative** — realistic patterns used to explain the architecture, not a shipped release.

## Why icon systems matter

Icons are deceptively small. A single icon is trivial; a *system* of two hundred icons, used across a dozen teams, rendered on the server, and shipped to millions of users, is an engineering problem with real performance, accessibility, and maintenance stakes.

Get it right and icons are invisible infrastructure. Get it wrong and you pay in bloated bundles, inconsistent visuals, inaccessible buttons, and a designer-to-developer handoff that breaks every sprint.

## Problems with scattered SVG files

The default approach — drop SVG files in `assets/` and reference them — accumulates problems:

- **No tree-shaking.** An SVG sprite or an `assets/` folder ships *every* icon, even the 180 you don't use on a given page.
- **Unoptimized markup.** Designer-exported SVGs carry editor cruft: comments, metadata, redundant precision, inline styles. Multiply by 200.
- **Inconsistent sizing and color.** Some icons hard-code `fill`, some `width`, some a `viewBox` that doesn't match — so they can't be uniformly styled.
- **Accessibility roulette.** Some are decorative, some are meaningful, but nothing enforces the correct `aria` treatment.
- **Manual, drifting sync.** When design adds an icon, someone hand-copies a file. The design source and the code diverge.
- **HTTP or FOUC costs.** Loading icons as separate files adds requests and can flash unstyled content.

An icon *system* solves these by making icons **code**, generated from a single source, optimized and tree-shakeable.

## Goals of @zellavora/icons

- **Single source of truth.** Icons live as source SVGs in one place; everything else is generated.
- **Optimized at build time.** SVGO-style optimization runs in the pipeline, not the browser.
- **Tree-shakeable.** Each icon is an individually importable, side-effect-free export. Unused icons never ship.
- **SSR-safe inline rendering.** Icons render as inline `<svg>` during server rendering — no client-side fetch, no FOUC.
- **Accessible by construction.** The component forces a decision: decorative (hidden from AT) or labeled.
- **Auto-synced.** A build step regenerates the icon modules from source, so design and code never drift.

```bash
npm install @zellavora/icons
```

## SVG optimization

Raw exports are wasteful. The pipeline normalizes and shrinks each icon:

- Strips comments, editor metadata, and `<title>`/`id` cruft
- Collapses redundant groups and rounds path precision
- Removes hard-coded `fill`/`stroke`, replacing with `currentColor` so icons inherit text color
- Normalizes `viewBox` to a consistent grid (e.g. `0 0 24 24`)

Before:

```xml
<svg xmlns="..." width="24px" height="24px" viewBox="0 0 24 24">
  <!-- Created with SketchTool -->
  <g fill="#1F2937" fill-rule="evenodd">
    <path d="M12.000,2.000 C6.477..."/>
  </g>
</svg>
```

After:

```xml
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M12 2C6.48..."/>
</svg>
```

The `currentColor` change is the important one: it makes every icon themeable with plain CSS `color`, no per-icon overrides.

## Auto-sync build pipeline

The pipeline turns a folder of source SVGs into typed, tree-shakeable Angular exports:

```
icons/source/*.svg
        │  (1) optimize (SVGO)
        ▼
icons/optimized/*.svg
        │  (2) generate
        ▼
src/lib/icons/*.ts        ← one export per icon
src/lib/icons/index.ts     ← barrel (for discovery, not for app imports)
src/lib/icons/manifest.ts  ← name → metadata map
```

Each generated icon is a plain data export — no component per icon, so there's nothing to instantiate:

```ts
// generated: src/lib/icons/arrow-right.ts
export const arrowRight: IconDef = {
  name: 'arrow-right',
  viewBox: '0 0 24 24',
  body: '<path d="M5 12h14M13 5l7 7-7 7"/>',
};
```

A single npm script (`zv-icons build`) runs the whole pipeline and is wired into CI (see below), so adding an icon is: drop the SVG in `source/`, run the script, commit the generated file.

## Tree shaking

This is the performance heart of the system. Because each icon is an individual, side-effect-free `export const`, a bundler drops every icon you don't import.

```ts
// Only these two icons end up in the bundle:
import { arrowRight, search } from '@zellavora/icons';

@Component({
  imports: [ZvIcon],
  template: `
    <zv-icon [icon]="arrowRight" />
    <zv-icon [icon]="search" size="20" />
  `,
})
export class ToolbarComponent {
  protected readonly arrowRight = arrowRight;
  protected readonly search = search;
}
```

Contrast with a sprite or `assets/` approach, where all 200 icons ship regardless. Import two, ship two.

> Anti-pattern: `import * as icons from '@zellavora/icons'` defeats tree-shaking by referencing everything. The lint rule ships to forbid it.

## SSR compatibility

The `ZvIcon` component renders the icon **inline** as an `<svg>` with the icon's `body` — no `<img src>`, no fetch, no sprite reference:

```ts
@Component({
  selector: 'zv-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.viewBox]="icon().viewBox"
         [style.width.px]="size()" [style.height.px]="size()"
         [attr.aria-hidden]="!label() ? 'true' : null"
         [attr.aria-label]="label()"
         [attr.role]="label() ? 'img' : null"
         [innerHTML]="safeBody()">
    </svg>
  `,
})
export class ZvIcon {
  readonly icon = input.required<IconDef>();
  readonly size = input(24);
  readonly label = input<string>();
  private sanitizer = inject(DomSanitizer);
  protected safeBody = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.icon().body));
}
```

Because the SVG body is known static data (from your own build pipeline, not user input), it renders identically on server and client — the icon is in the initial HTML, so there's no layout shift or flash on hydration.

## Angular integration

The component is standalone and signals-based (`OnPush`, zoneless-friendly). Two ergonomic touches:

**Sizing via a token** for global defaults:

```ts
provideZvIconConfig({ defaultSize: 20, strokeWidth: 2 });
```

**Consistent color via CSS** — because icons use `currentColor`, they inherit text color:

```html
<button class="danger">
  <zv-icon [icon]="trash" /> Delete
</button>
```

```scss
.danger { color: var(--accent-rose); } /* icon follows */
```

## Accessibility

The component makes accessibility a **required decision**, not an afterthought:

- **Decorative icon** (next to a text label) → no `label`, component sets `aria-hidden="true"`. Screen readers skip it, avoiding double-announcement.
- **Meaningful icon** (icon-only button) → pass `label`, component sets `role="img"` + `aria-label`.

```html
<!-- Decorative: text already conveys meaning -->
<button><zv-icon [icon]="save" /> Save</button>

<!-- Meaningful: icon is the only content -->
<button aria-label="Close">
  <zv-icon [icon]="close" label="Close" />
</button>
```

The default (`aria-hidden="true"`) is the safe one: an unlabeled icon is assumed decorative, which is correct the majority of the time.

## Installation and usage guide

```bash
npm install @zellavora/icons
```

```ts
import { ZvIcon } from '@zellavora/icons';
import { heart } from '@zellavora/icons';

@Component({
  selector: 'app-like',
  imports: [ZvIcon],
  template: `<zv-icon [icon]="heart" size="18" label="Like" />`,
})
export class LikeButton {
  protected readonly heart = heart;
}
```

Adding a custom icon:

```bash
# 1. Drop your SVG in the source folder
cp new-icon.svg icons/source/sparkle.svg
# 2. Regenerate
npx zv-icons build
# 3. Import it
```

## Performance metrics

*(Illustrative and directional — not measurements of a shipped build.)*

| Approach | Icons shipped (using 12 of 200) | Requests | SSR flash |
|---|---|---|---|
| `assets/*.svg` via `<img>` | 200 files available, N fetched | N HTTP | Possible |
| SVG sprite | All 200 in one file | 1 HTTP | Possible |
| `@zellavora/icons` (inline, tree-shaken) | 12 | 0 (inlined) | None |

The combination that matters: **only used icons ship** (tree-shaking) **and** they're **inline** (no requests, no flash).

## CI/CD workflow

The auto-sync pipeline belongs in CI so generated icons never drift from source and no one hand-edits generated files:

```yaml
# .github/workflows/icons.yml
name: Icons
on:
  pull_request:
    paths: ['icons/source/**']
jobs:
  build-icons:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx zv-icons build
      # Fail the PR if generated output is out of date
      - run: git diff --exit-code src/lib/icons \
          || (echo "Run 'npx zv-icons build' and commit." && exit 1)
```

This "generate-and-verify" gate is the trick: contributors add a source SVG, and CI guarantees the generated, optimized module is committed and in sync. Design and code can't diverge.

## Best practices

- **Import icons individually** — never `import *`. It's the whole basis of tree-shaking.
- **Use `currentColor`** and style via CSS `color`, not per-icon `fill`.
- **Decide decorative vs. meaningful** for every usage; don't leave icon-only buttons unlabeled.
- **Keep source SVGs on a consistent grid** (e.g. 24×24) so sizing is predictable.
- **Never hand-edit generated files** — change the source and regenerate.

## Common mistakes

- **Shipping the whole set.** A barrel `import *` or a sprite negates tree-shaking.
- **Icon-only buttons with no label.** Invisible to screen readers.
- **Hard-coded fills.** Breaks theming and dark mode.
- **Trusting untrusted SVG.** This system inlines *your own* build-pipeline SVGs; never `bypassSecurityTrust` on user-supplied markup.

## Conclusion

A good icon system is a build-time problem solved once so it disappears at runtime: optimize and generate from a single source, ship only what's imported, render inline for SSR, and force an accessibility decision at every use. `@zellavora/icons` shows how those pieces fit — SVGO-style optimization, per-icon tree-shakeable exports, an inline signals-based component, and a CI generate-and-verify gate — turning two hundred scattered files into invisible, fast, accessible infrastructure.
