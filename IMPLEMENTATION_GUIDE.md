# Premium Portfolio Implementation Guide

## Quick Start

### 1. Import Design Tokens & Animations

Add to your main `styles.scss`:

```scss
// Design tokens (must be first)
@import 'scss/design-tokens-premium';

// Animation utilities
@import 'scss/animations-premium';

// Rest of your styles...
```

### 2. Update Hero Component Usage

Replace the old hero component with the new premium hero:

```typescript
// OLD: hero.component.ts
import { HeroComponent } from './components/hero/hero.component';

// NEW: hero-premium.component.ts
import { HeroPremiumComponent } from './components/hero/hero-premium.component';

// In your home component:
@Component({
  imports: [HeroPremiumComponent], // Use new component
})
export class HomeComponent {}
```

### 3. Verify Portfolio Data Service

Ensure `PortfolioDataService` provides the required signals:

```typescript
hero() {
  return {
    badge: 'Available for Work',
    headline: 'Senior Frontend',
    headlineAccent: 'Engineer',
    description: '4+ years of expert Angular...',
    portrait: '/profile.webp',
    cta: {
      primary: { label: 'Explore Projects', href: '#projects' },
      booking: { label: 'Download Resume', href: '/resume.pdf' }
    },
    stack: [...], // Not used in new hero (using hardcoded skills)
    stats: [...]  // Not used in new hero (using hardcoded stats)
  }
}

meta() {
  return {
    name: 'Rabin R',
    role: 'Senior Frontend Engineer',
    profileImage: '/profile.webp'
  }
}
```

---

## Design System Color Usage

### Primary Accent (Violet)
- **Use for**: Buttons, links, highlights, badges
- **CSS Variables**:
  - `--accent-primary` — Main color (#7c3aed)
  - `--accent-primary-hover` — Hover state (#a855f7)
  - `--accent-primary-light` — Background tint (rgba 10%)
  - `--accent-primary-glow` — Glow effect (rgba 15%)

### Text Colors
- **Primary**: `--text-primary` (#f1f5f9) — Headings, main text
- **Secondary**: `--text-secondary` (#cbd5e1) — Body text, descriptions
- **Tertiary**: `--text-tertiary` (#94a3b8) — Meta text, labels
- **Disabled**: `--text-disabled` (#64748b) — Disabled state

### Background Colors
- **Primary**: `--bg-primary` — Page background
- **Secondary**: `--bg-secondary` — Surface backgrounds
- **Surface**: `--bg-surface` — Cards, sections
- **Hover**: `--bg-surface-hover` — Interactive hover

### Borders
- **Primary**: `--border-primary` (20% opacity) — Main borders
- **Secondary**: `--border-secondary` (10% opacity) — Subtle dividers

---

## Typography System

### Heading Sizes (Use clamp() for fluid sizing)

```scss
// H1 — Page title, hero headline
h1, .h1 {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: var(--font-weight-extrabold);
  line-height: 1.1;
  letter-spacing: -0.03em;
}

// H2 — Section titles
h2, .h2 {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4.5vw, 3.5rem);
  font-weight: var(--font-weight-bold);
  line-height: 1.15;
  letter-spacing: -0.02em;
}

// H3 — Subsection titles
h3, .h3 {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3.5vw, 2.5rem);
  font-weight: var(--font-weight-semibold);
  line-height: 1.2;
  letter-spacing: -0.01em;
}

// Body — Default text
body, p {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: var(--font-weight-normal);
  line-height: 1.6;
}

// Body Large — Prominent descriptions
.body-large {
  font-size: 1.125rem;
  line-height: 1.75;
}

// Caption — Small text, metadata
.caption {
  font-size: 0.875rem;
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
}
```

---

## Spacing System

Use 4px base grid:

```scss
// Tokens available:
--space-1: 4px     // Micro spacing
--space-2: 8px     // Small gaps
--space-3: 12px    // Compact padding
--space-4: 16px    // Standard padding
--space-6: 24px    // Medium padding
--space-8: 32px    // Large padding
--space-12: 48px   // Section gaps
--space-16: 64px   // Large gaps

// Usage example:
.card {
  padding: var(--space-6);           // 24px all sides
  margin-bottom: var(--space-8);     // 32px bottom
  gap: var(--space-4);               // 16px gaps
}
```

**Pro Tip**: Always use CSS variables instead of hardcoded values. This ensures consistency and makes theming easy.

---

## Component Patterns

### Buttons

**Primary Button** (CTA)
```html
<a href="#" class="btn btn-primary">
  <span>Explore Projects</span>
  <svg class="icon-arrow"><!-- Arrow icon --></svg>
</a>
```

**Secondary Button** (Alternative action)
```html
<a href="#" class="btn btn-secondary">
  <span>Download Resume</span>
</a>
```

### Cards

**Glass Card**
```scss
.card {
  background: var(--glass-lg);
  backdrop-filter: var(--glass-blur-md);
  border: 1px solid var(--interactive-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transition: all var(--duration-200) var(--ease-smooth-in-out);

  &:hover {
    background: var(--glass-lg);
    border-color: var(--interactive-border-hover);
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  }
}
```

### Badges

**Status Badge**
```html
<span class="badge badge-status">
  <span class="badge-dot"></span>
  <span class="badge-text">Available</span>
</span>
```

**Skill Pill**
```html
<span class="skill-pill">Angular</span>
<span class="skill-pill">TypeScript</span>
```

---

## Animation Guidelines

### Entrance Animations

```scss
// Use for elements that appear on page load
.element {
  animation: fadeInUp var(--duration-400) var(--ease-smooth-out) forwards;
  animation-delay: 0.2s; // Stagger for multiple elements
}

// Available animations:
// - fadeInUp: Slide up + fade in
// - fadeInScale: Scale 0.95 → 1
// - fadeInLeft/Right: Slide from side
// - slideInUp: Larger slide from bottom
```

### Micro Interactions

```scss
// Hover state animations
.btn {
  transition: all var(--duration-200) var(--ease-smooth-in-out);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4);
  }
}
```

### Looping Animations

```scss
// Use for continuous, background animations
.float {
  animation: float 4s var(--ease-in-out) infinite;
}

.pulse {
  animation: pulse 2s var(--ease-in-out) infinite;
}
```

### Performance Tips

✅ **DO**:
- Use `transform` (translateX, translateY, scale, rotate)
- Use `opacity` changes
- Keep animations under 600ms for UI, 3-4s for looping
- Use `will-change: transform` for continuous animations
- Limit to 5 simultaneous animations

❌ **DON'T**:
- Animate `width`, `height`, `margin`, `padding`
- Chain multiple animations on same element
- Animate more than 10 elements at once
- Use `top`, `left`, `bottom`, `right` (use `transform` instead)

---

## Responsive Design Approach

### Breakpoints
- Mobile: < 480px
- Tablet: 480px - 768px
- Desktop: 768px - 1024px
- Large: 1024px - 1400px
- XL: > 1400px

### Fluid Sizing with clamp()

```scss
// Instead of fixed sizes, use clamp for fluid responsiveness
// clamp(MIN, PREFERRED, MAX)

// Example: Font size that scales with viewport
font-size: clamp(1rem, 2vw, 1.5rem);

// Example: Padding that scales
padding: clamp(1rem, 3vw, 2rem);

// Example: Gap that scales
gap: clamp(1rem, 2vw, 2rem);
```

### Mobile-First Media Queries

```scss
// Default: Mobile styles
.element {
  font-size: 1rem;
  padding: var(--space-4);
}

// Tablet and up
@media (min-width: 768px) {
  .element {
    font-size: 1.125rem;
    padding: var(--space-6);
  }
}

// Desktop and up
@media (min-width: 1024px) {
  .element {
    font-size: 1.25rem;
    padding: var(--space-8);
  }
}
```

---

## Accessibility Checklist

### Color Contrast
- [ ] Text: 4.5:1 minimum ratio (WCAG AA)
- [ ] Large text: 3:1 minimum ratio
- [ ] Icons: 3:1 minimum ratio
- **Test**: Use Chrome DevTools > Accessibility tab or WebAIM Contrast Checker

### Focus States
```scss
// All interactive elements need visible focus
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
```

### Motion
```scss
// Respect user preference for reduced motion
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

### Semantic HTML
```html
<!-- ✓ Good -->
<button class="btn">Click me</button>
<nav role="navigation">...</nav>
<section aria-labelledby="section-title">
  <h2 id="section-title">Title</h2>
</section>

<!-- ✗ Bad -->
<div class="btn" onclick="...">Click me</div>
<div role="button">Click</div>
```

### Images & Icons
```html
<!-- Meaningful image -->
<img src="profile.jpg" alt="Rabin R, Senior Frontend Engineer" />

<!-- Decorative image -->
<img src="decoration.svg" alt="" aria-hidden="true" />

<!-- Icon button -->
<button aria-label="Close menu">
  <svg aria-hidden="true">...</svg>
</button>
```

---

## Applying Design System to Other Sections

### About Section

```scss
.about {
  // Use same background approach
  background: var(--bg-primary);
  padding: var(--space-16) var(--space-4);

  // Use heading scale
  h2 { /* H2 styles */ }

  // Use body text color
  p { color: var(--text-secondary); }

  // Use glass cards
  .card { /* Glass card styles */ }

  // Animate on entrance
  animation: fadeInUp var(--duration-500) var(--ease-smooth-out);
}
```

### Skills Section

```scss
.skills {
  // Skills container with grid
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-6);

  // Skill items
  .skill-item {
    background: var(--glass-md);
    border: 1px solid var(--interactive-border);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    transition: all var(--duration-200) var(--ease-smooth-in-out);

    &:hover {
      background: var(--glass-lg);
      border-color: var(--interactive-border-hover);
      transform: translateY(-4px);
    }
  }
}
```

### Projects Section

```scss
.projects {
  // Card grid
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-8);

  .project-card {
    background: var(--glass-md);
    border: 1px solid var(--interactive-border);
    border-radius: var(--radius-xl);
    overflow: hidden;
    transition: all var(--duration-300) var(--ease-smooth-in-out);

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(124, 58, 237, 0.2);
    }

    img {
      width: 100%;
      height: 250px;
      object-fit: cover;
      transition: transform var(--duration-300) var(--ease-smooth-in-out);
    }

    &:hover img {
      transform: scale(1.05);
    }
  }
}
```

### Timeline/Experience Section

```scss
.timeline {
  position: relative;
  padding-left: var(--space-8);

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, var(--accent-primary), transparent);
  }

  .timeline-item {
    position: relative;
    margin-bottom: var(--space-8);
    padding-left: var(--space-6);

    &::before {
      content: '';
      position: absolute;
      left: -28px;
      top: 2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--accent-primary);
      border: 3px solid var(--bg-primary);
    }
  }
}
```

### Contact Section

```scss
.contact {
  max-width: 600px;
  margin: 0 auto;

  .contact-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);

    label {
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
    }

    input,
    textarea {
      padding: var(--space-4);
      background: var(--glass-sm);
      border: 1px solid var(--interactive-border);
      border-radius: var(--radius-lg);
      color: var(--text-primary);
      font-family: var(--font-body);
      transition: all var(--duration-200) var(--ease-smooth-in-out);

      &:focus {
        outline: none;
        border-color: var(--accent-primary);
        background: var(--glass-md);
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
      }
    }
  }
}
```

---

## Performance Optimization

### Image Optimization

```html
<!-- Use responsive images -->
<picture>
  <source srcset="image.webp" type="image/webp" />
  <source srcset="image.jpg" type="image/jpeg" />
  <img 
    src="image.jpg" 
    alt="Description"
    width="1080"
    height="1440"
    fetchpriority="high"
    decoding="async"
  />
</picture>

<!-- Lazy load below-fold images -->
<img 
  src="image.jpg" 
  alt="Description"
  loading="lazy"
  width="800"
  height="600"
/>
```

### CSS Optimization
- Import design tokens once at the top
- Use CSS variables (no runtime calculation)
- Tree-shake unused styles in production
- Minify CSS before deploy

### Animation Performance
- Use `will-change: transform` for animations
- Limit simultaneous animations to 5
- Keep animations under 600ms for UI, 3-4s for looping
- Test on mid-range devices (throttle to 4G)

---

## Common Patterns

### Section Shell

```html
<section class="section" id="section-name" aria-labelledby="section-title">
  <div class="container">
    <h2 id="section-title" class="section-title">Section Title</h2>
    <p class="section-subtitle">Subtitle or description</p>
    <!-- Content -->
  </div>
</section>
```

```scss
.section {
  padding: var(--space-16) var(--space-4);
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;

  .container {
    max-width: 1400px;
    margin: 0 auto;
  }

  .section-title {
    // H2 styles
  }

  .section-subtitle {
    font-size: 1.125rem;
    color: var(--text-secondary);
    margin-top: var(--space-4);
  }
}
```

---

## Debugging & Testing

### Quick Checks
- [ ] Colors contrast against background (4.5:1)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] All buttons/links have focus visible states
- [ ] Text is readable on mobile (16px minimum)
- [ ] No layout shift when images load
- [ ] Hover states match design system
- [ ] Consistent spacing (using spacing scale)

### Browser DevTools
1. **Accessibility tab**: Check color contrast
2. **Lighthouse**: Performance, accessibility scores
3. **Responsive Design Mode**: Test at breakpoints
4. **CSS Overview**: Identify unused colors/sizes

### Common Issues
- **Text too small**: Use `font-size: clamp(1rem, 2vw, 1.25rem)` instead of fixed
- **Layout shifts**: Use aspect-ratio or explicit dimensions
- **Animations slow**: Profile with DevTools Performance tab
- **Low contrast**: Use WebAIM Contrast Checker tool

---

## Next Steps

1. ✅ Import design tokens & animations in main styles.scss
2. ✅ Replace hero component with hero-premium
3. ✅ Test hero on mobile, tablet, desktop
4. ✅ Apply design system to About section
5. ✅ Apply design system to Skills section
6. ✅ Apply design system to Projects section
7. ✅ Apply design system to Experience section
8. ✅ Apply design system to Contact section
9. ✅ Test accessibility (color contrast, keyboard nav, focus states)
10. ✅ Performance audit (Lighthouse)
11. ✅ Deploy to production

---

## Questions?

Refer to:
- `DESIGN_SYSTEM.md` — Complete design system specification
- `_design-tokens-premium.scss` — All CSS custom properties
- `_animations-premium.scss` — All animation definitions
- `hero-premium.component.scss` — Reference implementation
