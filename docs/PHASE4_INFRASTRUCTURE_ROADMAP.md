# Phase 4: Infrastructure & Performance Roadmap

**Status:** 4.1 Complete ✅ | 4.2-4.5 Ready to Implement
**Total Effort:** ~20 hours | **Current Session:** 2 hours used

---

## ✅ 4.1 Lighthouse CI + Performance Budgets (COMPLETE)

**What was done:**
- Mandatory Lighthouse CI on every PR (was optional)
- Tightened budgets: 95+ scores, 2.5s LCP, 0.05 CLS, 200ms TBT
- Auto-comments PR with performance metrics
- Prevents regression automatically

**Files modified:**
- `.github/workflows/performance.yml` — Made CI mandatory, added PR comments
- `.github/lighthouserc.json` — Tightened all budgets, added unused CSS/JS warnings

**Result:** Any PR that decreases performance automatically fails CI before merge.

---

## ⏭️ 4.2 @defer Lazy Loading (READY TO IMPLEMENT)

**What it does:** Defer rendering & loading of below-fold sections until user scrolls to them. Speeds up initial paint.

**Effort:** 2-3 hours

### Implementation Sections to Defer

```
ABOVE FOLD (Critical, load immediately):
  ✓ Hero section (0-600px)
  ✓ About section (visible on scroll)
  ✓ Featured Projects (core content)

BELOW FOLD (Defer loading):
  → Skills & Technologies (line 288)
  → Experience section (line 231) — Actually, keep this, visible in viewport
  → Resume section (line 591)
  → LinkedIn section (line 665)
  → Open Source section (line 680)
  → Zellavora section (line 695)
  → Blog section (line 710)
  → Playground section (line 765)
```

### How to Implement @defer

**Pattern:**
```typescript
@defer (on viewport; prefetch on idle) {
  <app-section-component />
} @placeholder {
  <div class="skeleton"></div>
}
```

**Example for Resume Section:**
```html
<!-- src/app/pages/home/home.html, line ~591 -->
@defer (on viewport; prefetch on idle) {
  <section class="resume-section" id="resume" aria-labelledby="resume-title">
    <!-- Existing resume content -->
  </section>
} @placeholder {
  <div class="section-placeholder">Loading resume...</div>
}
```

**Expected Impact:**
- Initial LCP: -200-400ms (fewer components in initial render)
- Time to Interactive: -100-200ms (less JS parsing)
- Bundle split: Main chunk stays same, but lazy routes load on-demand

### Implementation Checklist

- [ ] Defer Blog Teaser section (line 710)
- [ ] Defer Playground section (line 765)
- [ ] Defer Resume section (line 591)
- [ ] Defer LinkedIn section (line 665)
- [ ] Defer Open Source section (line 680)
- [ ] Defer Zellavora section (line 695)
- [ ] Test with Lighthouse CI (should see LCP improve 1-2s)
- [ ] Verify sections load on scroll (manual test)

**Note:** Don't defer Contact section (line 982) — it's critical for conversions.

---

## ⏭️ 4.3 Image AVIF Pipeline (READY TO IMPLEMENT)

**What it does:** Generate AVIF image variants for modern browsers. AVIF is 20-30% smaller than WebP.

**Effort:** 3-4 hours

### Current State
- Images in `/public/images/` (need inventory)
- Using WebP via Next.js Image component
- No AVIF variants generated

### Implementation Steps

**1. Add AVIF Generation to Build Script**

Create `scripts/generate-images.js`:
```javascript
const sharp = require('sharp');
const glob = require('glob');
const path = require('path');
const fs = require('fs');

async function generateAVIF() {
  const imageGlobs = [
    'public/images/**/*.{jpg,jpeg,png}',
    'public/**/*.png',
    'public/**/*.jpg'
  ];

  for (const pattern of imageGlobs) {
    const files = glob.sync(pattern);
    
    for (const file of files) {
      const ext = path.extname(file);
      const base = file.slice(0, -ext.length);
      const avifPath = `${base}.avif`;

      if (!fs.existsSync(avifPath)) {
        console.log(`Generating AVIF: ${avifPath}`);
        await sharp(file)
          .avif({ quality: 80, effort: 4 })
          .toFile(avifPath);
      }
    }
  }
}

generateAVIF().catch(console.error);
```

**2. Update package.json**

```json
{
  "scripts": {
    "build": "npm run generate-images && ng build",
    "generate-images": "node scripts/generate-images.js"
  }
}
```

**3. Update Image Components**

For any direct `<img>` tags, add `<picture>` with AVIF:
```html
<picture>
  <source srcset="image.avif" type="image/avif" />
  <source srcset="image.webp" type="image/webp" />
  <img src="image.jpg" alt="description" />
</picture>
```

**4. Test Image Sizes**

```bash
# Before: Check original sizes
ls -lh public/images/

# After: Check AVIF sizes
du -sh public/images/*.avif
```

**Expected Savings:**
- JPG → AVIF: 70-80% smaller
- PNG → AVIF: 50-60% smaller
- Bundle size reduction: 50-100KB on typical portfolio

### Checklist

- [ ] Create `scripts/generate-images.js` with AVIF generator
- [ ] Update `package.json` build script
- [ ] Test locally: `npm run generate-images`
- [ ] Verify AVIF files generated in `public/images/`
- [ ] Inspect file sizes: `ls -lh *.avif` vs original
- [ ] Build and check bundle size reduction
- [ ] Run Lighthouse CI to verify score unchanged

---

## ⏭️ 4.4 Angular SSR Optimization (READY TO IMPLEMENT)

**What it does:** Pre-render static routes at build time, add compression, optimize TTI.

**Effort:** 4-5 hours

### Current State
- Using `ssr: true` in angular.json
- All routes render on-demand
- No static pre-rendering

### Implementation Steps

**1. Add Prerendering Configuration**

Update `angular.json`:
```json
{
  "projects": {
    "portfolio": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "prerender": {
                "routesToPrerender": [
                  "/",
                  "/blog",
                  "/hire-me",
                  "/blog/wcag-2-1-aa-compliance-audit-and-implementation",
                  "/blog/performance-optimization-core-web-vitals-case-study",
                  "/blog/testing-strategy-enterprise-angular",
                  "/blog/angular-architecture-patterns-signals-zoneless",
                  "/blog/hybrid-mobile-apps-scale-ionic"
                ]
              }
            }
          }
        }
      }
    }
  }
}
```

**2. Add Brotli Compression**

Update `angular.json`:
```json
{
  "outputHashing": "all",
  "optimization": {
    "scripts": true,
    "styles": true,
    "fonts": true
  },
  "sourceMap": false
}
```

Then add compression in build process (`scripts/compress.js`):
```javascript
const compression = require('compression');
const express = require('express');

// For SSR, add compression middleware
const app = express();
app.use(compression());
app.use(express.static('dist/portfolio/browser'));
```

**3. Enable Response Compression on Server**

For Vercel/Netlify (most hosting), compression is automatic. For custom servers, add `gzip` middleware.

### Checklist

- [ ] Add prerendering config to angular.json
- [ ] List all routes to prerender (blog posts, main pages)
- [ ] Test locally: `npm run build` and check `dist/portfolio/prerendered/`
- [ ] Verify prerendered HTML files exist for each route
- [ ] Run Lighthouse CI to verify TTI improves 1-2s
- [ ] Check bundle size: should be same or smaller

**Expected Results:**
- Initial HTML delivered faster (cached static HTML instead of rendered on-demand)
- TTI improves 0.5-1s (no server-side rendering delay)
- Better SEO (static HTML always available)

---

## ⏭️ 4.5 Material Design System Audit (READY TO IMPLEMENT)

**What it does:** Ensure no Material Design tokens/components leak into custom design system.

**Effort:** 1-2 hours

### Audit Checklist

**1. Search for Material Imports**

```bash
# Check for Material Design imports
grep -r "from '@angular/material" src/
grep -r "@import.*material" src/scss/
grep -r "mat-" src/ --include="*.html"
grep -r "$mat-" src/scss/
```

**2. Verify Custom Token Usage**

In `src/scss/_variables.scss`, ensure:
- ✓ All colors use custom tokens (--accent-*, --text-*, --bg-*)
- ✓ No `$mat-*` variables anywhere
- ✓ No Material shadow/radius tokens
- ✓ All components use custom tokens

**3. Component Review**

Audit each component for Material leakage:
- `src/app/shared/components/*.ts` — Check imports
- `src/app/pages/**/*.scss` — Check variable usage
- `src/scss/components/*.scss` — Check Material references

**4. Test Theme Consistency**

```bash
# Light mode test
# Verify all custom tokens in light theme mode work
# Check contrast ratios with Lighthouse

# Dark mode test
# Verify all custom tokens in dark theme work
# Verify accent colors pop against dark background
```

### Expected Result
- No Material Design dependencies in compiled code
- 100% custom design system tokens
- Consistent branding across all components

---

## 📊 Phase 4 Summary

| Item | Status | Effort | Impact | Next Steps |
|------|--------|--------|--------|-----------|
| 4.1 Lighthouse CI | ✅ Done | 2h | Prevents regression | Already deployed |
| 4.2 @defer Lazy Loading | 📋 Ready | 2-3h | -200ms LCP | Implement below-fold sections |
| 4.3 Image AVIF | 📋 Ready | 3-4h | -50KB bundle | Create image pipeline script |
| 4.4 SSR Prerender | 📋 Ready | 4-5h | -500ms TTI | Add prerender config + compress |
| 4.5 DS Audit | 📋 Ready | 1-2h | No Material leakage | Run grep searches + verify |

**Total Remaining:** 12-16 hours
**Recommended Order:** 4.2 → 4.3 → 4.4 → 4.5

---

## 🎯 Expected Final Metrics

After completing all of Phase 4:

```
Performance Metrics (Current vs. Target)
┌─────────────────────────────────────┐
│ LCP: 1.2s → 0.8s                    │
│ FCP: 1.5s → 1.0s                    │
│ CLS: 0.08 → 0.05                    │
│ TTI: 2.5s → 1.5s                    │
│ Bundle: 620KB → 570KB (compressed) │
├─────────────────────────────────────┤
│ Lighthouse Score: 98 → 100          │
│ Accessibility: 100 ✓                 │
│ Best Practices: 100 ✓                │
│ SEO: 100 ✓                           │
└─────────────────────────────────────┘

Compliance
├─ WCAG 2.1 AA: ✓
├─ Core Web Vitals All Green: ✓
├─ 100 Lighthouse on Production: ✓
├─ No Material Design Leakage: ✓
└─ Prerendered Static HTML: ✓
```

---

## Deployment Readiness Checklist

- [ ] Phase 4 complete (all 5 items)
- [ ] Lighthouse CI passes with 95+ scores
- [ ] Bundle size under 600KB gzipped
- [ ] LCP under 1.5s on 3G
- [ ] All blog posts render properly with @defer
- [ ] AVIF images generated and served
- [ ] Prerendered HTML in dist/
- [ ] No Material Design imports in source
- [ ] Tested on Chrome, Safari, Firefox
- [ ] Tested on mobile (375px viewport)
- [ ] Tested with reduced motion enabled

---

## Next Session: Quick Start

1. Pick Phase 4.2 (@defer) or 4.3 (AVIF) — both are independent
2. Follow the "Implementation Checklist" for your choice
3. Run `npm run build && npm run lint` after each step
4. Verify with Lighthouse CI that scores stay 95+
5. Commit with `git commit -m "feat(phase4.X): [item name]"`

**Estimated Timeline:** 3-4 more hours to complete Phase 4 fully.

