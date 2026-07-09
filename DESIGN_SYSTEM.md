# Premium Portfolio Design System
## Senior Frontend Engineer | Rabin R

Version 1.0 | Modern SaaS-Inspired Design System

---

## Design Philosophy

**Aesthetic**: Modern, premium, clean, professional
**Inspirations**: Linear.app, Vercel, Framer, Stripe, Clerk, Aceternity UI, Magic UI
**Target Audience**: Recruiters, Hiring Managers, Senior Developers, Potential Clients
**Core Message**: Expert. Trustworthy. Innovative. Professional.

---

## Color Palette

### Primary Colors
- **Accent**: `#7c3aed` (Violet-600) - Primary brand color
- **Accent Light**: `#a78bfa` (Violet-400) - Hover, highlights
- **Accent Glow**: `rgba(124, 58, 237, 0.15)` - Soft backgrounds

### Neutrals (Dark Theme)
- **Background Primary**: `#0f172a` (Slate-950)
- **Background Secondary**: `#1e293b` (Slate-900)
- **Surface**: `#334155` (Slate-700)
- **Text Primary**: `#f1f5f9` (Slate-100)
- **Text Secondary**: `#cbd5e1` (Slate-300)
- **Text Tertiary**: `#94a3b8` (Slate-400)
- **Border**: `rgba(148, 163, 184, 0.2)` (Slate-400 @ 20%)

### Accent Colors
- **Teal**: `#14b8a6` (Success/Availability)
- **Cyan**: `#06b6d4` (Highlights)
- **Purple**: `#c084fc` (Gradient)

### Light Theme (Optional)
- **Background**: `#ffffff`
- **Surface**: `#f8fafc` (Slate-50)
- **Text**: `#0f172a` (Slate-950)
- **Border**: `rgba(15, 23, 42, 0.1)`

---

## Typography Scale

### Heading Scale (Display Font: General Sans / Inter)
| Level | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|-------------|----------------|
| H1    | `clamp(2.5rem, 6vw, 4.5rem)` | 800 | 1.1 | -0.03em |
| H2    | `clamp(2rem, 4.5vw, 3.5rem)` | 700 | 1.15 | -0.02em |
| H3    | `clamp(1.5rem, 3.5vw, 2.5rem)` | 600 | 1.2 | -0.01em |
| H4    | `clamp(1.25rem, 2.5vw, 1.75rem)` | 600 | 1.3 | 0 |
| H5    | `1.125rem` | 600 | 1.4 | 0 |
| H6    | `0.875rem` | 600 | 1.5 | 0.05em (uppercase) |

### Body Text (Font: Inter)
| Level | Size | Weight | Line Height |
|-------|------|--------|-------------|
| Body Large | `1.125rem` | 400 | 1.75 |
| Body | `1rem` | 400 | 1.6 |
| Body Small | `0.9375rem` | 400 | 1.6 |
| Caption | `0.875rem` | 500 | 1.5 |
| Label | `0.8125rem` | 600 | 1.5 |
| Micro | `0.75rem` | 500 | 1.4 |

---

## Spacing System

Based on 4px unit grid:

| Scale | Value | Use Case |
|-------|-------|----------|
| xs    | 4px   | Micro spacing, icons |
| sm    | 8px   | Button padding, gaps |
| md    | 12px  | Card padding small |
| base  | 16px  | Standard padding |
| lg    | 24px  | Section gaps, padding |
| xl    | 32px  | Large gaps, padding |
| 2xl   | 48px  | Section spacing |
| 3xl   | 64px  | Large section gaps |
| 4xl   | 96px  | Hero padding |

---

## Border Radius

| Scale | Value | Use Case |
|-------|-------|----------|
| xs    | 4px   | Small elements |
| sm    | 6px   | Buttons, badges |
| md    | 8px   | Small cards |
| lg    | 12px  | Cards, frames |
| xl    | 16px  | Large cards, images |
| 2xl   | 20px  | Hero image, modals |
| full  | 9999px| Pills, circles |

---

## Shadows & Elevation

### Base Shadows
```scss
// Elevation 1: Subtle, close
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);

// Elevation 2: Mid-depth
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);

// Elevation 3: Elevated
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);

// Elevation 4: High elevation
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);

// Glow: Accent glow for premium feel
--glow-accent: 0 0 20px rgba(124, 58, 237, 0.3);
--glow-accent-strong: 0 0 40px rgba(124, 58, 237, 0.4);
```

---

## Glass Morphism System

```scss
// Premium glass effect with blur
--glass-light: {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

// Medium glass for cards
--glass-medium: {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

// Strong glass for modals
--glass-strong: {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(148, 163, 184, 0.2);
}
```

---

## Animation System

### Timing Functions
```scss
--ease-out-smooth: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Duration Scale
| Micro | Fast | Base | Slow | Slow-Slow |
|-------|------|------|------|-----------|
| 100ms | 150ms | 250ms | 400ms | 600ms |

### Core Animations

#### Entrance Animations
- **Fade In Up**: Slide up 20px with opacity 0→1 (400ms)
- **Fade In Scale**: Scale 0.95→1 with opacity 0→1 (400ms)
- **Fade In Left**: Slide from left with opacity (400ms)
- **Fade In Right**: Slide from right with opacity (400ms)

#### Micro Interactions
- **Hover Scale**: 1 → 1.02 (150ms)
- **Hover Lift**: translateY(-2px) (200ms)
- **Hover Glow**: Shadow + glow increase (200ms)
- **Hover Brighten**: Opacity/color shift (150ms)

#### Looping Animations
- **Float**: Gentle up/down motion (4-6s)
- **Pulse**: Opacity pulse (2s)
- **Shimmer**: Gradient sweep (3s)
- **Scroll Indicator**: Fade in/out scroll cue (3s)

#### Performance
- Use `transform` and `opacity` only (GPU accelerated)
- Avoid layout-triggering properties (width, height, margin)
- Prefer `will-change: transform` for continuous animations
- Respect `prefers-reduced-motion` media query

---

## Component Patterns

### Buttons

#### Primary Button
```
Style: Gradient (Violet → Purple)
Padding: 14px 32px (premium size)
Font: 15px, 600 weight
Hover: Lift + glow effect
Icon: Right-aligned arrow icon
```

#### Secondary Button
```
Style: Glass + border
Padding: 14px 32px
Font: 15px, 600 weight
Hover: Border brighten + lift
No icon
```

#### Tertiary Button
```
Style: Transparent
Padding: 12px 24px
Font: 14px, 600 weight
Hover: Subtle background
Minimal styling
```

### Cards

#### Premium Card
```
Background: Glass medium effect
Border: Gradient (optional)
Padding: 24px
Radius: 16px
Shadow: Elevation 3
Hover: Lift + enhanced glow
```

#### Stat Card
```
Background: Glass light
Border: 1px solid border color
Padding: 16px 20px
Radius: 12px
Content: Number (large, accent) + Label (small, secondary)
No hover effect (static)
```

### Badges & Pills

#### Availability Badge
```
Padding: 8px 16px
Border: 1px solid accent
Background: Accent @ 10%
Radius: Full
Font: 12px, 500 weight
Animated dot: Pulse animation
```

#### Skill Pill
```
Padding: 6px 14px
Border: 1px solid accent @ 25%
Background: Accent @ 8%
Radius: Full
Font: 12px, 500 weight
Hover: Lift + glow
```

### Gradients

#### Hero Gradient (Text)
```scss
background: linear-gradient(135deg, #c4b5fd 0%, #06b6d4 45%, #a78bfa 100%);
```

#### Button Gradient (Primary)
```scss
background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
```

#### Accent Gradient
```scss
background: linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%);
```

### Background Effects

#### Gradient Blob (Accent)
```scss
// Large, blurred radial gradient
position: absolute;
width: 60%;
height: 80%;
background: radial-gradient(ellipse at center, rgba(124, 58, 237, 0.15) 0%, transparent 65%);
filter: blur(60px);
animation: float 12s ease-in-out infinite;
```

#### Mesh Grid
```scss
// Subtle grid background pattern
background-image: linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px);
background-size: 40px 40px;
```

#### Noise Texture
```scss
// Subtle noise overlay (1-2% opacity)
background-image: url('data:image/svg+xml...');
opacity: 0.02;
```

---

## Responsive Breakpoints

| Device | Width | Grid Cols | Font Scale |
|--------|-------|-----------|------------|
| Mobile | < 480px | 1 (full) | 90% |
| Tablet | 480px - 768px | 1-2 | 95% |
| Desktop | 768px - 1200px | 2 | 100% |
| Large Desktop | > 1200px | 3 | 110% |

### Mobile-First Approach
- Start with mobile defaults
- Use `@media (min-width: ...)` for larger screens
- Ensure 44px minimum touch target size
- Use `clamp()` for fluid sizing

---

## Accessibility (WCAG AA)

### Color Contrast
- Text: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- UI Components: Minimum 3:1 ratio

### Focus States
- Visible focus ring: 2px solid accent color
- Focus ring offset: 2px
- All interactive elements must be keyboard navigable

### Motion
- Respect `prefers-reduced-motion: reduce`
- Disable animations for users who prefer reduced motion
- Essential animations (loading) should still work

### Semantics
- Use semantic HTML: `<button>`, `<nav>`, `<section>`, etc.
- Provide alt text for all meaningful images
- Use ARIA labels for icon-only buttons
- Proper heading hierarchy (h1 → h2 → h3...)

### Forms
- Labels associated with inputs via `for` attribute
- Clear error messages near form fields
- Success/validation feedback visible

---

## Implementation Standards

### File Organization
```
src/
  app/
    shared/
      directives/
      components/
        ui/              # Reusable UI components
          button.component.ts
          badge.component.ts
          card.component.ts
          stats-card.component.ts
        shared/          # Shared layout components
          navbar.component.ts
          footer.component.ts
      services/
      styles/
        _design-tokens.scss
        _glass.scss
        _animations.scss
        _gradients.scss
    pages/
      home/
        components/
          hero/
          about/
          experience/
          skills/
          projects/
          blog/
          contact/
```

### Component Template Structure
```html
<section class="section-name" [attr.id]="'section-id'" [attr.aria-labelledby]="'section-title'">
  <div class="container">
    <h2 id="section-title" class="section-title">Title</h2>
    <!-- Content -->
  </div>
</section>
```

### SCSS Structure per Component
```scss
// 1. Design token references
// 2. Component root styles
// 3. Child element styles
// 4. State modifiers (:hover, :active, :disabled)
// 5. Animations (keyframes)
// 6. Responsive breakpoints (@media)
```

---

## Performance Guidelines

### Image Optimization
- Use WebP format with fallback
- Implement lazy loading for below-fold images
- Provide responsive images with `srcset`
- Optimize file size (< 200kb per hero image)

### Animation Performance
- Use `transform` and `opacity` (GPU accelerated)
- Avoid `width`, `height`, `margin`, `padding` animations
- Use `will-change: transform` for continuous animations
- Limit simultaneous animations to < 5

### Bundle Optimization
- Lazy load heavy components (blog, projects)
- Code split by route
- Tree-shake unused styles
- Minify CSS/JS in production

---

## Design System Usage

### When Building a New Section

1. **Reference Design Tokens**: Use CSS custom properties from design system
2. **Apply Typography Scale**: Use H1-H6 or body text scales
3. **Use Spacing System**: Use 4px grid for consistent spacing
4. **Add Animations**: Use entrance animations from animation system
5. **Test Accessibility**: Verify color contrast, focus states, keyboard nav
6. **Check Responsiveness**: Test at 375px, 768px, 1024px, 1440px
7. **Optimize Performance**: Use only transform/opacity for animations

### Color Usage
- Primary accent: Buttons, highlights, important text
- Secondary accent: Hover states, subtle highlights
- Neutral text: Primary for body, secondary for meta, tertiary for disabled
- Borders: Use border color with 10-20% opacity
- Backgrounds: Layer with glass morphism for depth

### Component Reusability
- Create UI components for: button, badge, card, stat-card
- Pass variations as `@Input()` properties
- Use BEM naming for SCSS classes
- Keep components standalone and testable
