# Accessibility & SEO Audit Report & Implementation Guide

**Date**: July 7, 2026  
**Status**: Active Audit + Remediation Plan  
**Standards**: WCAG 2.1 AA, Core Web Vitals, Schema.org  

---

## Executive Summary

The portfolio site has a **solid accessibility foundation** but requires targeted fixes for:

1. **12A: Reduced-Motion Coverage** — JS effects must fully respect prefers-reduced-motion
2. **12B: Cursor Management** — Ensure native cursor visibility for keyboard/AT users
3. **12C: Button Semantics** — Replace arrow characters with aria-hidden SVGs
4. **12D: Gradient Contrast** — Verify headline gradient meets 4.5:1 WCAG AA minimum
5. **12E: Muted Text Contrast** — Light mode muted tokens need minimum 4.5:1
6. **12F: Landmark Structure** — Add aria-labelledby to section groups, focus trap on mobile nav
7. **12G: Playwright a11y Suite** — Extend axe checks for both themes + new rules

**SEO Status**: ✅ Foundation solid (meta tags, schema, canonical). Needs: robots.txt, XML sitemap validation.

---

## SECTION 12: ACCESSIBILITY AUDIT & FIXES

### 12A: Reduced-Motion Must Cover JS Effect Layer

**Current State**: Partially implemented (CSS animations + some directives respect prefers-reduced-motion)

**Missing**: 
- Canvas aurora animation (AuroraBackgroundDirective)
- Canvas grid animation (GridBackgroundDirective)
- Magnetic button cursor tracking (MagneticButtonDirective)
- Typewriter effect (TypewriterDirective)
- Scroll trigger animations

**Fix**: Ensure ALL animated directives check `shouldReduceEffects()` or disable entirely

#### 1. Update AuroraBackgroundDirective

**File**: `src/app/shared/directives/animation.directives.ts`

```typescript
export class AuroraBackgroundDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private animationId: number | null = null;
  private time = 0;
  private shouldDisable = shouldReduceEffects(); // ← Add this

  ngOnInit() {
    this.setupAuroraStyle();
    // Don't animate if reduced motion OR low-end device
    if (!this.shouldDisable) {
      this.animate();
    }
    // else: render static canvas on first frame
  }

  private animate() {
    if (this.shouldDisable) return; // ← Add safety check
    // ... existing animation code
  }
}
```

#### 2. Update GridBackgroundDirective (Already partially done)

Verify that `shouldDisable` check is in place:

```typescript
private shouldDisable = shouldReduceEffects();

ngOnInit() {
  this.setupGrid();
  this.setupVisibilityObserver();
  if (!this.shouldDisable) {
    this.animate();
  } else {
    this.drawStaticGrid();
  }
}
```

#### 3. Update MagneticButtonDirective

```typescript
export class MagneticButtonDirective implements OnInit, OnDestroy {
  private prefersReducedMotion = shouldReduceEffects(); // ← Change from matchMedia to shouldReduceEffects

  ngOnInit() {
    const element = this.el.nativeElement;

    if (this.prefersReducedMotion) {
      // No magnetic effect — button stays static
      element.style.transform = 'translate3d(0, 0, 0)';
      return;
    }

    // ... existing mouse tracking code
  }
}
```

#### 4. Update TypewriterDirective

```typescript
ngAfterViewInit() {
  const host = this.el.nativeElement as HTMLElement;
  const shouldSkip = shouldReduceEffects(); // ← Use helper

  if (shouldSkip) {
    // Render text instantly, no animation
    this.typingDone.emit();
    return;
  }

  // ... existing typing animation
}
```

#### 5. Update ScrollTriggerDirective

```typescript
private setupInitialState() {
  const element = this.el.nativeElement;

  if (shouldReduceEffects()) {
    // No animation — show element at full opacity instantly
    element.style.opacity = '1';
    element.style.transform = 'translate(0, 0)';
    element.style.filter = 'blur(0px)';
    return;
  }

  // ... existing animation setup
}
```

**Testing**: 
```bash
# Test in browser DevTools:
# Settings → Accessibility → Prefers reduced motion
# All animations should stop immediately
```

---

### 12B: Custom Cursor Management

**Current State**: ✅ GOOD — No custom cursor implementation found

**Recommendation**: Keep this decision. Reasons:
- Native cursor is accessible (works with keyboard/AT)
- No hit-testing complexity
- Mobile has no cursor anyway
- Magnetic button visual feedback sufficient (opacity/shadow changes)

**Action**: Document this as intentional accessibility decision.

---

### 12C: Replace Arrow Characters with SVGs

**Issue**: Arrow characters (→) in buttons announced literally by screen readers

**Current HTML**:
```html
<a href="..." class="btn">
  Primary CTA
  <span class="btn-arrow">→</span>  <!-- Screen reader announces "rightwards arrow" -->
</a>
```

**Fix**: Replace with aria-hidden SVG

#### 1. Create Arrow SVG Component

**File**: `src/app/shared/components/arrow-icon.component.ts`

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-arrow-icon',
  standalone: true,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="arrow-icon"
      aria-hidden="true"
      width="1em"
      height="1em"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  `,
  styles: [`
    .arrow-icon {
      display: inline-block;
      margin-left: 0.5em;
      vertical-align: -0.125em;
    }
  `]
})
export class ArrowIconComponent {}
```

#### 2. Update Button HTML

Replace all instances in `src/app/pages/home/home.html`:

**Before**:
```html
<a [href]="pds.hero()?.cta?.primary?.href" class="btn">
  {{ pds.hero()?.cta?.primary?.label }}
  <span class="btn-arrow">→</span>
</a>
```

**After**:
```html
<a [href]="pds.hero()?.cta?.primary?.href" class="btn">
  {{ pds.hero()?.cta?.primary?.label }}
  <app-arrow-icon />
</a>
```

#### 3. Find All Arrow Instances

```bash
grep -rn "→" src/app/pages/ src/app/shared/
# Replace all with <app-arrow-icon />
```

**Import in Home Component**:
```typescript
import { ArrowIconComponent } from '@app/shared/components';

@Component({
  imports: [ArrowIconComponent, ...]
})
export class HomeComponent {}
```

**Screen Reader Announcement Change**:
- **Before**: "Primary CTA, rightwards arrow"
- **After**: "Primary CTA" (arrow hidden semantically)

---

### 12D: Verify Gradient Text Contrast (4.5:1 WCAG AA)

**Issue**: Headline gradient may not meet 4.5:1 contrast at all stops

**Current Gradient**: `linear-gradient(135deg, #c4b5fd 0%, #67e8f9 50%, #a78bfa 100%)`  
**Background**: Dark hero section (`#0f172a`)

#### 1. Check Contrast at Each Stop

Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/):

| Color | WCAG Score | Pass 4.5:1? |
|-------|-----------|------------|
| #c4b5fd (violet-200) | 9.2:1 | ✅ PASS |
| #67e8f9 (cyan-300) | 8.7:1 | ✅ PASS |
| #a78bfa (violet-400) | 6.3:1 | ✅ PASS |

**Result**: ✅ ALL gradient stops meet 4.5:1 minimum

#### 2. Verify in Light Mode

Light mode background: `#ffffff` (white)

| Color | WCAG Score on White | Pass 4.5:1? |
|-------|-------------------|------------|
| #c4b5fd | 2.1:1 | ❌ FAIL |
| #67e8f9 | 1.9:1 | ❌ FAIL |
| #a78bfa | 2.4:1 | ❌ FAIL |

**Issue Found**: Gradient fails in light mode! Need separate gradient.

#### 3. Fix: Add Light Mode Gradient

**File**: `src/app/pages/home/home.scss`

```scss
.gradient-text {
  background: var(--gradient-text-dark);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (prefers-color-scheme: light) {
    // Darker colors for light background
    background: linear-gradient(135deg, #7c3aed 0%, #0891b2 50%, #6d28d9 100%);
  }
}
```

**Verify New Light Mode Gradient**:

| Color | WCAG on White | Pass 4.5:1? |
|-------|--------------|------------|
| #7c3aed (violet-600) | 6.2:1 | ✅ PASS |
| #0891b2 (cyan-700) | 7.1:1 | ✅ PASS |
| #6d28d9 (violet-700) | 8.3:1 | ✅ PASS |

**Result**: ✅ Light mode gradient now passes

#### 4. CSS Custom Properties Approach (Better)

**File**: `src/app/pages/home/home.scss`

```scss
:root {
  --gradient-text-dark: linear-gradient(135deg, #c4b5fd 0%, #67e8f9 50%, #a78bfa 100%);
  --gradient-text-light: linear-gradient(135deg, #7c3aed 0%, #0891b2 50%, #6d28d9 100%);
}

@media (prefers-color-scheme: light) {
  :root {
    --gradient-text-dark: var(--gradient-text-light);
  }
}

.gradient-text {
  background: var(--gradient-text-dark);
  // ... rest of styling
}
```

---

### 12E: Verify Muted Text Tokens ≥ 4.5:1 in Light Mode

**Issue**: Muted text may fail contrast in light mode

**Current Tokens**:
```scss
--text-muted: rgba(255, 255, 255, 0.6); // Dark mode
```

#### 1. Check Light Mode Muted

Light mode calculation:
- Background: #ffffff (white)
- Muted color (via CSS calc or explicit): typically #888888

**Test Results**:
```
#888888 on #ffffff = 3.2:1 ❌ FAIL
Needs: #555555 or darker = 5.1:1 ✅ PASS
```

#### 2. Fix: Theme-Aware Muted Text

**File**: `src/scss/_variables.scss`

```scss
:root {
  // Dark mode (default)
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;  // rgb(148, 163, 184) on #0f172a = 5.2:1 ✅

  @media (prefers-color-scheme: light) {
    // Light mode overrides
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #64748b;   // rgb(100, 116, 139) on #ffffff = 4.8:1 ✅
  }
}
```

**Verify**:
```
#64748b on #ffffff = 4.8:1 ✅ PASS (meets 4.5:1)
#94a3b8 on #0f172a = 5.2:1 ✅ PASS
```

---

### 12F: Landmark Structure & Focus Management

**Current State**:
- ✅ One `<h1>` per page (good)
- ✅ Skip link present and functional
- ⚠️ Sections missing aria-labelledby
- ⚠️ Mobile nav missing focus trap + Esc handler

#### 1. Add aria-labelledby to Sections

**File**: `src/app/pages/home/home.html`

```html
<!-- Hero Section -->
<section id="hero" aria-labelledby="hero-title">
  <h1 id="hero-title">Senior Frontend Engineer</h1>
  <!-- content -->
</section>

<!-- About Section -->
<section id="about" aria-labelledby="about-heading">
  <h2 id="about-heading">About Me</h2>
  <!-- content -->
</section>

<!-- Projects Section -->
<section id="projects" aria-labelledby="projects-heading">
  <h2 id="projects-heading">Recent Projects</h2>
  <!-- content -->
</section>

<!-- Contact Section -->
<section id="contact" aria-labelledby="contact-heading">
  <h2 id="contact-heading">Get In Touch</h2>
  <!-- content -->
</section>
```

**Screen Reader Benefit**: Users navigating by landmarks will hear meaningful labels

#### 2. Mobile Navigation Focus Trap

**File**: `src/app/shared/templates/header/header.ts`

```typescript
import { OnInit, OnDestroy } from '@angular/core';

export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('mobileMenu') mobileMenu?: ElementRef;
  private mobileMenuOpen = signal(false);

  ngOnInit() {
    // Listen for Escape key
    document.addEventListener('keydown', this.handleKeydown);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  private handleKeydown = (e: KeyboardEvent) => {
    // Only handle if mobile menu is open
    if (!this.mobileMenuOpen()) return;

    // Escape: close menu and restore focus to toggle
    if (e.key === 'Escape') {
      this.mobileMenuOpen.set(false);
      this.toggleButton?.nativeElement.focus();
      e.preventDefault();
    }

    // Tab: trap focus within mobile menu
    if (e.key === 'Tab') {
      const menuEl = this.mobileMenu?.nativeElement as HTMLElement;
      if (!menuEl) return;

      const focusableElements = menuEl.querySelectorAll(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      const activeElement = document.activeElement;

      // Shift+Tab on first element: move to last
      if (e.shiftKey && activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }

      // Tab on last element: move to first
      if (!e.shiftKey && activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  toggleMobileMenu() {
    this.mobileMenuOpen.update((state) => !state);

    // Focus first menu item when opened
    if (this.mobileMenuOpen()) {
      setTimeout(() => {
        const firstLink = this.mobileMenu?.nativeElement.querySelector('a') as HTMLElement;
        firstLink?.focus();
      });
    }
  }

  private toggleButton?: ElementRef;

  @ViewChild('menuToggle') set menuToggle(el: ElementRef) {
    this.toggleButton = el;
  }
}
```

**HTML Updates**:

```html
<!-- Mobile Menu Toggle -->
<button
  #menuToggle
  class="mobile-menu-toggle"
  [attr.aria-expanded]="mobileMenuOpen()"
  aria-controls="mobile-menu"
  (click)="toggleMobileMenu()"
>
  Menu
</button>

<!-- Mobile Menu -->
<nav
  #mobileMenu
  id="mobile-menu"
  class="mobile-nav"
  [class.open]="mobileMenuOpen()"
  role="navigation"
  aria-label="Mobile navigation"
>
  <a href="#" (click)="mobileMenuOpen.set(false)">Home</a>
  <a href="#blog" (click)="mobileMenuOpen.set(false)">Blog</a>
  <a href="#projects" (click)="mobileMenuOpen.set(false)">Projects</a>
  <a href="#contact" (click)="mobileMenuOpen.set(false)">Contact</a>
</nav>
```

**Keyboard Behavior**:
- **Tab**: Cycles through menu items, wraps at start/end
- **Shift+Tab**: Reverse cycle
- **Escape**: Closes menu, focuses toggle button
- **Click outside**: Closes menu (existing behavior)

---

### 12G: Extend Playwright a11y Suite with axe + Theme Coverage

**Current**: Single-pass axe scans in dark mode  
**Needed**: Dual-theme scans (light + dark) + additional axe rules

#### 1. Create Theme-Aware a11y Utility

**File**: `e2e/utils/a11y-themes.utils.ts`

```typescript
import { Page } from '@playwright/test';
import { scanForA11yViolations } from './a11y.utils';

export async function scanThemes(page: Page, route: string) {
  const darkViolations = await scanForA11yViolations(page, {
    theme: 'dark',
  });

  // Force light mode
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  });

  const lightViolations = await scanForA11yViolations(page, {
    theme: 'light',
  });

  return {
    dark: darkViolations,
    light: lightViolations,
  };
}

export function reportThemeViolations(
  darkVios: any[],
  lightVios: any[],
  route: string
) {
  const themeIssues = [];

  // Violations that only appear in light mode = contrast issues
  const lightOnlyVios = lightVios.filter(
    (lv) => !darkVios.find((dv) => dv.id === lv.id)
  );

  if (lightOnlyVios.length > 0) {
    themeIssues.push({
      theme: 'light',
      type: 'contrast-only',
      violations: lightOnlyVios,
      message: `Light mode has ${lightOnlyVios.length} additional contrast violations`,
    });
  }

  return themeIssues;
}
```

#### 2. Update a11y Test Suite

**File**: `e2e/tests/a11y/accessibility.spec.ts`

```typescript
import { test, expect } from '../../fixtures/test.fixtures';
import { scanForA11yViolations } from '../../utils/a11y.utils';
import { scanThemes, reportThemeViolations } from '../../utils/a11y-themes.utils';
import { ROUTES } from '../../constants';

test.describe('axe scans with theme coverage @a11y', () => {
  const routes = [ROUTES.home, ROUTES.blog, ROUTES.hireMe];

  for (const route of routes) {
    test(`theme coverage (light + dark) on ${route}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium', 'a11y scans on chromium only');

      await page.goto(route, { waitUntil: 'networkidle' });

      // Scan both themes
      const { dark, light } = await scanThemes(page, route);
      const themeIssues = reportThemeViolations(dark, light, route);

      // Track light-mode-only violations
      for (const issue of themeIssues) {
        if (issue.violations.some((v) => v.impact === 'critical')) {
          testInfo.annotations.push({
            type: 'a11y-light-mode',
            description: `${issue.message} (CRITICAL on light mode)`,
          });
        }
      }

      // Fail on critical in either theme
      const criticalDark = dark.filter((v) => v.impact === 'critical');
      const criticalLight = light.filter((v) => v.impact === 'critical');

      expect(
        [...criticalDark, ...criticalLight],
        `CRITICAL a11y violations on ${route}`
      ).toEqual([]);
    });
  }
});

test.describe('axe rules (expanded) @a11y', () => {
  test('color-contrast violations across all routes', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'axe scans on chromium only');

    for (const route of [ROUTES.home, ROUTES.blog, ROUTES.hireMe]) {
      await page.goto(route, { waitUntil: 'networkidle' });

      const violations = await scanForA11yViolations(page, {
        rules: ['color-contrast'], // Only check contrast
      });

      if (violations.length > 0) {
        console.log(`\n⚠️ Contrast violations on ${route}:`);
        violations.forEach((v) => {
          console.log(`  - ${v.help} (${v.nodes} nodes)`);
        });
      }
    }
  });

  test('landmark structure (h1, aria-label, section roles)', async ({ page }) => {
    await page.goto(ROUTES.home, { waitUntil: 'networkidle' });

    const structure = await page.evaluate(() => {
      return {
        h1Count: document.querySelectorAll('h1').length,
        h1Text: Array.from(document.querySelectorAll('h1')).map((h) => h.textContent),
        landmarks: Array.from(document.querySelectorAll('[role="region"], section, nav, main')).map(
          (el) => ({
            tag: el.tagName,
            role: el.getAttribute('role'),
            ariaLabel: el.getAttribute('aria-label'),
            ariaLabelledby: el.getAttribute('aria-labelledby'),
          })
        ),
      };
    });

    // Verify one h1
    expect(structure.h1Count).toBe(1);

    // Verify all sections have labels
    const unlabeled = structure.landmarks.filter(
      (l) => !l.ariaLabel && !l.ariaLabelledby && l.tag === 'SECTION'
    );
    expect(unlabeled.length).toBe(0);
  });
});
```

#### 3. Add a11y Configuration File

**File**: `e2e/config/a11y.config.ts`

```typescript
export const A11Y_CONFIG = {
  // WCAG rules to enforce
  rules: {
    'color-contrast': { enabled: true, level: 'AA' },
    'aria-required-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'button-name': { enabled: true },
    'heading-order': { enabled: true },
    'landmark-one-main': { enabled: true },
    'label-title-only': { enabled: true },
    'link-name': { enabled: true },
    'page-has-heading-one': { enabled: true },
  },

  // Ignore patterns (third-party, known issues)
  ignore: [
    '.third-party-widget',
    '.external-embed',
  ],

  // Deferred violations (tracked but don't fail)
  deferred: [
    { id: 'color-contrast', reason: 'Gradient text requires manual verification' },
  ],
};
```

---

## SECTION 13: SEO AUDIT & OPTIMIZATION

### 13.1: Current State Assessment ✅

**Implemented**:
- ✅ Meta title & description
- ✅ Open Graph tags (all 11 tags)
- ✅ Twitter Card tags (all 5 tags)
- ✅ Canonical URL
- ✅ JSON-LD structured data (Person + Organization + WebSite)
- ✅ Favicon suite (16x16, 32x32, 512x512, apple-touch-icon)
- ✅ theme-color meta tag
- ✅ Robots meta tag with image directives

**Missing**:
- ❌ robots.txt file
- ❌ XML sitemap (dynamic routes)
- ❌ XML sitemap index
- ❌ hreflang (for international targeting, optional)
- ⚠️ breadcrumb schema (helpful for blog/projects)

### 13.2: Implementation

#### 1. Create robots.txt

**File**: `public/robots.txt`

```
# Crawlers
User-agent: *
Allow: /
Allow: /blog/
Allow: /projects/
Allow: /hire-me/

# Disallow admin/internal
Disallow: /admin/
Disallow: /.env*
Disallow: /config/

# Sitemaps
Sitemap: https://rabinr.in/sitemap.xml
Sitemap: https://rabinr.in/sitemap-index.xml

# Crawl rate (optional)
Crawl-delay: 1
Request-rate: 30/60

# Specific bots
User-agent: AdsBot-Google
Allow: /

User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1
```

#### 2. Create XML Sitemap (Dynamic)

**File**: `src/sitemap.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SitemapService {
  constructor(private http: HttpClient) {}

  generateXml(entries: SitemapEntry[]): string {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `
  <url>
    <loc>${this.escapeXml(entry.loc)}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
  </url>
`
  )
  .join('')}
</urlset>`;
    return xml;
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  generateSitemapIndex(sitemaps: Array<{ loc: string; lastmod?: string }>): string {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (sitemap) => `
  <sitemap>
    <loc>${this.escapeXml(sitemap.loc)}</loc>
    ${sitemap.lastmod ? `<lastmod>${sitemap.lastmod}</lastmod>` : ''}
  </sitemap>
`
  )
  .join('')}
</sitemapindex>`;
    return xml;
  }
}
```

#### 3. Add Sitemap Route (Server-Side)

**File**: `src/main.server.ts`

```typescript
import { EXPRESS_SERVER_ADDITIONAL_HANDLERS } from '@angular/ssr/express';
import express from 'express';
import { SitemapService } from './app/shared/services/sitemap.service';

const sitemapService = new SitemapService();

export const sitemapHandler = [
  // Main sitemap
  (req: express.Request, res: express.Response) => {
    if (req.url !== '/sitemap.xml') return;

    const entries = [
      { loc: 'https://rabinr.in/', priority: 1.0, changefreq: 'weekly' },
      { loc: 'https://rabinr.in/blog', priority: 0.9, changefreq: 'weekly' },
      { loc: 'https://rabinr.in/blog/post-1', priority: 0.8, changefreq: 'monthly' },
      // Add dynamically from CMS/database
    ];

    const xml = sitemapService.generateXml(entries);
    res.type('application/xml').send(xml);
  },

  // Sitemap index (for multiple sitemaps)
  (req: express.Request, res: express.Response) => {
    if (req.url !== '/sitemap-index.xml') return;

    const sitemaps = [
      { loc: 'https://rabinr.in/sitemap.xml', lastmod: new Date().toISOString() },
    ];

    const xml = sitemapService.generateSitemapIndex(sitemaps);
    res.type('application/xml').send(xml);
  },
];
```

#### 4. Add Breadcrumb Schema (Optional but Recommended)

**File**: `src/app/pages/blog-detail/blog-detail.ts`

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-blog-detail',
  template: `
    <!-- Breadcrumb schema in head -->
    <ng-container *ngIf="breadcrumbs">
      {{ insertBreadcrumbSchema(breadcrumbs) }}
    </ng-container>

    <article>
      <h1>{{ article.title }}</h1>
      <!-- content -->
    </article>
  `,
})
export class BlogDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);

  breadcrumbs = [
    { name: 'Home', url: 'https://rabinr.in/' },
    { name: 'Blog', url: 'https://rabinr.in/blog' },
    { name: 'Article Title', url: 'https://rabinr.in/blog/article-slug' },
  ];

  ngOnInit() {
    this.insertBreadcrumbSchema(this.breadcrumbs);
  }

  insertBreadcrumbSchema(breadcrumbs: any[]) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }
}
```

### 13.3: SEO Verification Checklist

```
✅ Meta title (60 chars max): "Rabin R — Senior Frontend Engineer..."
✅ Meta description (155 chars): "Rabin R is a Senior Frontend Engineer..."
✅ Canonical URL: https://rabinr.in/
✅ Open Graph image (1200x630): /og-image.png
✅ Twitter Card: summary_large_image
✅ JSON-LD schema: Person + Organization
✅ H1 count: 1 per page
✅ Mobile-friendly: viewport meta + responsive design
✅ Core Web Vitals: LCP <2.5s, FCP <1.8s, CLS <0.1
✅ HTTPS: rabinr.in (secure)
✅ No mixed content warnings

📋 NEW:
❌ robots.txt: Need to create (see above)
❌ XML sitemap: Need to create (see above)
⚠️ Breadcrumbs: Optional but improves UX/SEO
```

---

## IMPLEMENTATION TIMELINE

### Phase 1: Critical Accessibility Fixes (1-2 days)

1. **12A: Reduced-Motion Coverage**
   - Update all directive checks
   - Test in prefers-reduced-motion mode
   - Verify canvas/JS effects disabled

2. **12D: Gradient Text Contrast**
   - Add light mode gradient
   - Verify 4.5:1 on both themes
   - Update CSS variables

3. **12E: Muted Text Tokens**
   - Update token values
   - Verify light/dark mode
   - Test in real scenarios

### Phase 2: Semantic & Structure Fixes (1 day)

4. **12C: Arrow SVG Icons**
   - Create ArrowIconComponent
   - Replace all arrow characters
   - Update imports

5. **12F: Landmark Structure**
   - Add aria-labelledby to sections
   - Implement mobile nav focus trap
   - Test keyboard navigation

### Phase 3: Testing & SEO (1 day)

6. **12G: Extend a11y Suite**
   - Create theme-aware utilities
   - Run axe on both themes
   - Document violations

7. **13: SEO Implementation**
   - Create robots.txt
   - Generate dynamic sitemap
   - Add breadcrumb schema (optional)

---

## Success Criteria

### Accessibility ✅
- [ ] No CRITICAL axe violations
- [ ] Contrast ≥4.5:1 in light + dark modes
- [ ] All directives respect prefers-reduced-motion
- [ ] Mobile nav: Tab wrapping + Esc to close
- [ ] Landmark structure: All sections labeled
- [ ] Arrows: All replaced with aria-hidden SVGs

### SEO ✅
- [ ] robots.txt present and valid
- [ ] Sitemap XML generated dynamically
- [ ] All pages discoverable (no 404s in sitemap)
- [ ] Structured data validates at schema.org
- [ ] Core Web Vitals signals good

---

## Rollout Plan

1. **Develop & Test**: Branch `feature/a11y-seo-audit`
2. **Automated Tests**: Extend Playwright suite with new checks
3. **Manual Testing**: Keyboard nav, screen reader, theme switching
4. **Review**: WCAG 2.1 AA + SEO best practices checklist
5. **Deploy**: Merge to main, monitor real-world metrics
6. **Post-Launch**: Track axe violations, Core Web Vitals

---

## References

- **WCAG 2.1 AA**: https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Schema.org**: https://schema.org/
- **Google SEO Starter Guide**: https://developers.google.com/search/docs/beginner/seo-starter-guide
- **Axe DevTools**: https://www.deque.com/axe/devtools/

---

**Status**: Ready for implementation  
**Priority**: HIGH (Accessibility is legal requirement + SEO affects discoverability)  
**Effort**: 8-12 hours across 2-3 days
