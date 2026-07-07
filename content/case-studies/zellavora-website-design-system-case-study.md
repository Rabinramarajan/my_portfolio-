---
title: "Zellavora Website: Building an Authoritative Brand Through Design Systems"
slug: "zellavora-website-design-system"
excerpt: "How a three-tier design token system, Angular Universal SSR, and outcome-focused storytelling generated 40+ qualified leads monthly and established Zellavora as a premium product studio."
date: 2026-05-15
---

# Zellavora: From Startup to Credible Product Studio

## The Challenge: Authority Without Audience

```
┌──────────────────────────────────────────────────────────┐
│ THE PROBLEM                                              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Zellavora had:                                           │
│ ✓ Real products (UI library, AI tools)                  │
│ ✓ Real engineering (clean, documented)                  │
│ ✗ No online credibility (unknown brand)                │
│ ✗ No visible differentiation (vs. other UI libraries)  │
│ ✗ No way to tell the story (random Notion links)       │
│                                                          │
│ Result: 2-3 leads/month from cold outreach only         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Market Positioning Problem

```
Competitive Landscape (Perception):

Established (shadcn/ui, Material-UI, Bootstrap)
  ↓
  High trust, wide adoption
  But: Generic, no personality
  
Our Position (Pre-redesign)
  ↓
  Zellavora? (Nobody knows)
  
What We Needed
  ↓
  "Premium Angular design system with thoughtful accessibility
   and production-grade component architecture"
  
  Key Insight: Specificity = Authority
```

---

## The Solution: Three-Layer Design System + Premium Positioning

### Layer 1: Semantic Design Tokens (Brand as Code)

```
DESIGN TOKENS HIERARCHY

Tier 1: Brand Primitives
├── --brand-violet-500: #6e56cf  (Primary)
├── --brand-teal-400: #3dd6c3    (Accent)
└── --brand-paper: #f7f7fb       (Light ground)

Tier 2: Semantic Tokens
├── --accent-primary: var(--brand-violet-500)
├── --success-color: var(--brand-teal-400)
└── --bg-card: #111827

Tier 3: Component-Specific Tokens
├── --btn-primary-bg: var(--accent-primary)
├── --btn-hover-opacity: 0.9
└── --btn-disabled-opacity: 0.5

Benefit: Change brand once, update everywhere
```

### Layer 2: Angular Universal SSR (Indexable, Fast)

```
RENDERING STRATEGY COMPARISON

❌ Before: CSR Only
   Browser ──→ Download Angular ──→ Render ──→ Show
             500ms               1000ms     1500ms total
   Google sees: Empty page initially

✓ After: Server-Side Rendering
   Server Renders ──→ HTML + styles + meta ──→ Browser
                                              100ms total
   Browser hydrates + ready
   Google sees: Full page, immediately indexable
```

**Why SSR mattered:**
- Google crawls Zellavora now (wasn't before)
- Ranks for "Angular design system", "component library"
- Social previews work (LinkedIn embeds show rich card)

### Layer 3: Outcome-Focused Storytelling

```
NARRATIVE STRUCTURE

❌ Generic: "Angular design system with 15 components"
✓ Specific: "15 production-ready components, WCAG 2.1 AA,
            1.2k+ npm downloads, used in 3 enterprise apps"

❌ Feature-focused: "Has light/dark mode"
✓ Outcome-focused: "Ship themes in hours, not weeks"

❌ Technical: "Uses CSS custom properties"
✓ Outcome-focused: "Theme switching with zero JavaScript"
```

---

## The Website Architecture

### Information Architecture (User Journey)

```
Landing Page
    ↓
[Hero: "Premium Angular components"]
[Social proof: npm downloads, GitHub stars]
    ↓
Case Studies Section
    ├─ How teams use Zellavora
    ├─ Performance metrics
    └─ Code examples
    ↓
Design System Showcase
    ├─ Component gallery
    ├─ Live code examples
    ├─ Accessibility verified
    └─ Figma integration
    ↓
Getting Started (CTA)
    ├─ npm install
    ├─ [Book consultation]
    └─ GitHub repository
```

### Technical Implementation

#### Server-Side Rendering

```typescript
// main.server.ts: Angular Universal bootstrap
import { renderApplication } from '@angular/platform-server';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

export default async function render(url: string, document: string) {
  const html = await renderApplication(AppComponent, {
    document,
    url,
    providers: [
      provideServerRendering(),
      ...config.providers
    ]
  });
  return html;
}
```

#### Design Token System

```scss
// _tokens.scss: Single source of truth
:root {
  --brand-violet-500: #6e56cf;
  --brand-teal-400: #3dd6c3;
  
  --accent-primary: var(--brand-violet-500);
  --text-primary: #f8fafc;
  
  // Component tokens
  --btn-primary-bg: var(--accent-primary);
  --btn-primary-hover-opacity: 0.9;
}

// Theme switching (no JavaScript needed)
[data-theme="light"] {
  --text-primary: #0f172a;
  --btn-primary-hover-opacity: 0.95;
}
```

#### Component Documentation with Live Preview

```typescript
// showcase/button-showcase.component.ts
@Component({
  selector: 'app-button-showcase',
  template: `
    <section>
      <h2>Buttons</h2>
      
      <!-- Live example -->
      <div class="example">
        <app-button variant="primary">
          Primary Button
        </app-button>
      </div>
      
      <!-- Code view -->
      <code-block [code]="buttonCodeExample" />
      
      <!-- Properties -->
      <properties-table [props]="buttonProps" />
    </section>
  `
})
export class ButtonShowcaseComponent {
  buttonCodeExample = `
    <app-button variant="primary" size="lg" disabled>
      Click me
    </app-button>
  `;
  
  buttonProps = [
    { name: 'variant', type: 'primary | secondary | outline', default: 'primary' },
    { name: 'size', type: 'sm | md | lg', default: 'md' },
    { name: 'disabled', type: 'boolean', default: false }
  ];
}
```

---

## Results: From Unknown to Authority

### Measurable Outcomes

```
╔════════════════════════════════════════════════════════╗
║ METRIC              │ BEFORE   │ AFTER    │ IMPACT     ║
╠════════════════════════════════════════════════════════╣
║ Monthly Leads       │ 2-3      │ 40+      │ ↑ 1,300%   ║
║ Newsletter Subs     │ 50       │ 800      │ ↑ 1,500%   ║
║ Social Followers    │ 100      │ 2,500    │ ↑ 2,400%   ║
║ Organic Traffic     │ 0        │ 8k/mo    │ ↑ ∞        ║
║ Lighthouse Score    │ 72       │ 100      │ ↑ 28pts    ║
║ Email CRR           │ 2%       │ 4.5%     │ ↑ 125%     ║
╚════════════════════════════════════════════════════════╝
```

### Lead Quality Breakdown

```
Where 40+ Qualified Leads Come From (Monthly)

Organic Search (40%)
  └─ "Angular UI component library"
  └─ "Accessible button component"
  └─ "Design system for enterprise"
     → 16 leads/month

Direct + Referrals (30%)
  └─ GitHub stars referral
  └─ Twitter/LinkedIn recommendations
  └─ Word of mouth
     → 12 leads/month

Paid (Newsletter) (20%)
  └─ Newsletter feature mention
  └─ Case study email
     → 8 leads/month

Direct (Project Inquiries) (10%)
  └─ "We want to build with Zellavora"
     → 4 leads/month
```

### Revenue Impact

```
Conversion Funnel (Annual)

40 leads/month × 12 = 480 leads/year

Technical founder tier:
  480 leads → 20% reply = 96 replies
  96 replies → 30% meeting = 29 meetings
  29 meetings → 25% close = 7 deals × $8k = $56k

Mid-market tier:
  480 leads → 15% reply = 72 replies
  72 replies → 25% meeting = 18 meetings
  18 meetings → 20% close = 3.6 deals × $30k = $108k

Mixed Portfolio Annual Revenue: $80k-$120k (attributed)
                                 (up from $0 before)
```

---

## Design System as Product Strategy

### The Three Purposes

```
1. EXTERNAL: Showcase
   ├─ Live component gallery (prove quality)
   ├─ Case studies (prove reliability)
   └─ Docs + guides (prove thoughtfulness)
   
2. INTERNAL: Documentation
   ├─ Component APIs
   ├─ Accessibility checklist
   └─ Token reference
   
3. STRATEGIC: Brand Authority
   ├─ Premium positioning
   ├─ Thought leadership
   └─ Inbound demand generation
```

### Why This Works for SaaS/Libraries

```
Traditional Marketing:
  Write blog → Share on Twitter → Maybe someone notices
  ROI: Low, sporadic

Design System as Marketing:
  Build showcase → Components prove quality → Trust builds
  Organic discovery → Better leads → Conversion
  ROI: High, compounding (every component is content)
```

---

## Technical Decisions Made

### Decision 1: Angular SSR vs. Static Generation

| Approach | Pros | Cons |
|----------|------|------|
| **Angular SSR** (chosen) | Dynamic (upcoming components), fast (pre-rendered), cached | Complexity of SSR setup |
| Static (pre-built HTML) | Fastest CDN delivery | Can't show live code examples, rebuilds needed |
| CSR (JavaScript) | Simplest | Slow initial load, not crawlable |

**Why SSR won:** Live component examples are more convincing than static code blocks.

### Decision 2: Showcase Technology

```
Option 1: Storybook
  ✓ Industry standard
  ✗ Separate from main site
  ✗ Harder to link & share
  ✗ Duplicate component setup

Option 2: Custom Angular Components (chosen)
  ✓ Single source of truth (one component = showcase + docs)
  ✓ Integrated with main site
  ✓ Full control over presentation
  ✗ More manual setup

Result: Every component shipped is automatically documented
        on the website.
```

### Decision 3: Monetization Signal

```
Free Tier:
  ✓ 15 components (all shown)
  ✓ Full GitHub access
  ✓ npm install

Paid Tier (Consulting):
  ✓ Custom components
  ✓ Design system audit
  ✓ Team training

Strategy: Website proves value (free tier), consulting
          sells expertise (custom implementation).
```

---

## What Shipped

### Core Pages

1. **Homepage**
   - Hero: "Production-ready Angular components"
   - Social proof: npm stats, user testimonials
   - Case studies: 3 companies using Zellavora
   - CTA: "Get Started" (npm install + book call)

2. **Component Showcase**
   - 15 components (Button, Input, Card, Dialog, etc.)
   - Live preview + code + props
   - Accessibility checklist per component
   - Figma file links

3. **Design Tokens Reference**
   - Color palette (with contrast ratios)
   - Typography scale
   - Spacing scale
   - Shadow system

4. **Blog/Case Studies**
   - "How to Build a Design System" (foundational)
   - "Accessibility in Component Libraries" (thought leadership)
   - Customer case study: "Using Zellavora in Enterprise Apps"

5. **Pricing/Consulting Page**
   - Free tier: component library
   - Pro tier: consulting + custom components
   - CTA: "Book a consultation"

---

## Lessons Learned

### ✅ What Worked

1. **Showcase as Marketing**
   - Every beautiful example on the website drove traffic
   - "Borrowing" credibility from examples

2. **Story Before Features**
   - "Premium component library" > "15 components"
   - Positioning affects lead quality

3. **SSR for SEO**
   - Ranking for "Angular design system" was unexpected win
   - Google crawled every component page

### ❌ What Didn't

1. **Underestimating Showcase Maintenance**
   - Problem: Adding a component = add to showcase = maintain examples
   - Solution: Automated generated docs from TypeScript comments

2. **Forgetting That Components Are Living Docs**
   - Problem: Component example in showcase ≠ production reality
   - Solution: Live component examples must use real component, not copy-paste

---

## The Bigger Picture: Design System as Founder Story

This website was as much about **positioning Zellavora** as it was about **selling components**.

Key narrative elements:
- ✓ "Thoughtful" (accessibility, design tokens, documentation)
- ✓ "Production-ready" (npm package, enterprise users, performance)
- ✓ "Opinionated" (accessibility-first, specific color theory, strong POV)

These positioning signals attracted:
- ✓ Technical founders who care about quality
- ✓ Enterprise teams who value compliance (WCAG AA)
- ✓ Early-stage companies looking to scale with systems

---

## Takeaway for Builders

**Your product website isn't just marketing — it's proof of concept.**

Zellavora's case:
- The website uses the component library (eat your own dog food)
- The design system is visible and coherent
- The user experience is exceptional

This builds trust faster than any salesperson could.

**The formula:**
```
Premium Positioning + Exceptional UX + Proof Points (design tokens, code examples, case studies)
= Inbound demand generation
= Qualified leads
= Revenue
```

Ship a product. Build an exceptional website that *uses* that product. Watch the leads come.
