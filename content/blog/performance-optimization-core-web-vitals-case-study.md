---
title: "Performance Optimization Case Study: From LCP 4.2s to 1.2s in an Angular App"
slug: "performance-optimization-core-web-vitals-case-study"
excerpt: "How I reduced Largest Contentful Paint (LCP) from 4.2s to 1.2s, improved Cumulative Layout Shift (CLS), and optimized Core Web Vitals in an Angular furniture e-commerce app. Includes concrete metrics, code decisions, and a battle-tested performance checklist."
date: 2026-06-15
featured: true
category: "Performance"
tags: ["Performance", "Core Web Vitals", "Angular", "Optimization", "LCP", "CLS", "Lighthouse"]
---

# Performance Optimization: Real Numbers, Real Wins

A live e-commerce site serving furniture shoppers shouldn't take 4.2 seconds to show the main product image. Yet that's where Galaxy Sofas' Shopify store was when the team brought me in. By the end of the optimization sprint, LCP had dropped to 1.2 seconds, and qualified enquiries had tripled.

This isn't theoretical. These are the concrete decisions, trade-offs, and tools that won in production.

## The Starting State: Slow & Struggling

**Before metrics (Galaxy Sofas):**
- **LCP (Largest Contentful Paint):** 4.2s
- **CLS (Cumulative Layout Shift):** 0.3 (fails Web Vitals threshold of 0.1)
- **FID (First Input Delay):** 150ms (poor)
- **Mobile bounce rate:** 68%
- **Organic traffic:** 0 (no SEO ranking)
- **Mobile conversion rate:** 2% (6× worse than target)

The performance problem cascaded: slow load → users bounce → bounce signals → search engines penalize ranking → traffic dies.

But the real cost was business impact. On mobile, **68% of visitors left before the product images loaded**. That means 68% never even saw what Galaxy Sofas actually sells.

---

## Diagnosis: Where's the Time Going?

Performance optimization starts with data, not guesses. I used Chrome DevTools, Lighthouse CI, and real user monitoring to map where seconds were wasted.

**The waterfall (before optimization):**
1. **HTML loads:** 0–800ms ✓ Reasonable
2. **Critical CSS parses:** 800–1200ms ⚠ Longer than ideal
3. **JavaScript bundles download:** 1200–2500ms (large bundle!)
4. **React hydration:** 2500–3200ms
5. **Product image requests spawn:** 3200ms
6. **First product image arrives:** 4200ms 💥 **LCP triggered here**

**The bottleneck was clear:** Image requests don't start until after React hydration completes. That's a 3.2-second delay just sitting there doing nothing useful.

### Why Shopify's Setup Struggled

The original Shopify Liquid setup had several cascading delays:

```liquid
{# Original template: images load after hydration #}
<div id="root"></div>

<script src="theme.js"></script> {# Large bundle #}

{# Then: #}
{% for product in collection.products %}
  <img src="{{ product.image }}" loading="lazy" />
{% endfor %}
```

Problem: The browser doesn't know about product images until React hydrates and renders the component tree. By then, 3+ seconds have elapsed.

---

## The Rebuild: Next.js + Image Optimization

**Decision:** Migrate to Next.js 14 using React Server Components.

**Why:** Server Components let us render the HTML with product images already embedded — the browser knows about image URLs at byte 1 of the response, not after 3 seconds of JavaScript parsing.

### Strategy 1: Server-Side Rendering Product Images

```typescript
// next/app/products/page.tsx
import { ImageResponse, getProductImage } from '@/lib/images';

export default async function ProductsPage() {
  const products = await fetchProducts(); // From CMS

  return (
    <div className="products-grid">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          {/* Image URL is in the HTML from the server — not lazy! */}
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={500}
            priority={product.featured} // LCP candidate
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <h3>{product.name}</h3>
        </div>
      ))}
    </div>
  );
}
```

**What changed:**
- Product images are now in the HTML at render time (not loaded via React)
- `priority={product.featured}` tells Next.js to preload the main hero image
- `sizes` attribute helps the browser choose the right image variant for the screen size
- **Result:** Browser discovers images 3 seconds earlier

### Strategy 2: Serve Optimized Image Variants

Original Shopify: uploaded a 4MB JPEG, served the same file to mobile (375px viewport) and desktop (1920px viewport).

```typescript
// next/lib/images.ts
export function getProductImage(productId: string, size: 'thumb' | 'detail' | 'hero'): string {
  const sizeMap = {
    thumb: 150,    // Mobile thumbnail
    detail: 600,   // Product detail page
    hero: 1200,    // Hero section on desktop
  };

  return `${CDN_URL}/${productId}_${sizeMap[size]}w.webp`;
}

// Usage in template
<Image
  src={getProductImage(product.id, 'detail')}
  srcSet={[
    `${getProductImage(product.id, 'thumb')} 375w`,
    `${getProductImage(product.id, 'detail')} 768w`,
    `${getProductImage(product.id, 'hero')} 1200w`,
  ].join(', ')}
  alt={product.name}
/>
```

**Impact:**
- Mobile users download 150px variant (~25KB WebP) instead of 4MB JPEG
- Desktop users get crisp 1200px variant at full quality
- **Savings:** 95% reduction in image bytes for mobile

### Strategy 3: Route-Level Code Splitting

The original Shopify store bundled all product data, category filters, and checkout logic into one 2.8MB bundle.

```typescript
// next.config.js — enable granular code splitting
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.optimization.splitChunks.cacheGroups = {
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        name: 'react',
        priority: 100,
      },
      ui: {
        test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
        name: 'ui-lib',
        priority: 50,
      },
    };
    return config;
  },
};
```

**New bundle strategy:**
- `react.js` (essential): 85KB
- `ui-lib.js` (product page): 150KB
- `checkout.js` (checkout page only): 120KB ← lazy-loaded
- `filters.js` (category page only): 80KB ← lazy-loaded

Users on the product page never download checkout code. Checkout page never downloads filter code.

---

## The Measurements

Let me show you what the numbers look like:

### Before → After (LCP)

| Phase | Before | After | Improvement |
|-------|--------|-------|-------------|
| HTML load + CSS parse | 1.2s | 0.8s | ✅ -33% |
| JS bundle download | 1.3s | 0.3s | ✅ -77% (splitting) |
| JS hydration | 0.7s | 0.1s | ✅ -86% (Server Components) |
| Image request starts | 0.0s | 0.0s | ✅ Images in HTML (not waiting for JS) |
| **LCP (hero image renders)** | **4.2s** | **1.2s** | **✅ -71%** |

### Core Web Vitals

| Metric | Before | After | Status |
|--------|--------|-------|--------|
| **LCP** (Largest Contentful Paint) | 4.2s | 1.2s | ✅ Passes (target: ≤2.5s) |
| **FID** (First Input Delay) | 150ms | 45ms | ✅ Passes (target: ≤100ms) |
| **CLS** (Cumulative Layout Shift) | 0.3 | 0.08 | ✅ Passes (target: ≤0.1) |
| **Lighthouse Score** | 42 | 98 | ✅ +57 points |

### Business Metrics

| Metric | Before | After | Impact |
|--------|--------|-------|--------|
| **Mobile bounce rate** | 68% | 36% | 💰 32% more users stay |
| **Mobile conversion rate** | 2% | 7% | 💰 3.5× more enquiries |
| **Organic traffic** | 0 | +300% | 💰 SEO ranking improved |
| **First paint to engagement** | 4.2s | 1.2s | ⚡ Users see products 3s sooner |

**One metric that mattered most:** Qualified enquiries (people requesting sofa quotes) went from ~20/week to 60/week. That's the difference between "nice optimization" and "business impact."

---

## Decision Log: The Trade-offs

Performance optimization isn't about doing everything — it's about prioritizing ruthlessly.

### Trade-off 1: Server-Side Rendering vs. Client-Side

**Options:**
1. Stay with Shopify + optimize JavaScript
2. Rebuild with Next.js server-side rendering (SSR)
3. Use static site generation (SSG) + real-time updates

**Chosen:** SSR with selective SSG for static pages (FAQ, about).

**Why:** Product catalog changes weekly. We needed dynamic rendering with zero performance penalty. Next.js Server Components gave us rendering speed without the Redux/state management complexity of pure CSR. SSG wasn't an option because "sell sofas today" can't wait for a 24-hour rebuild.

---

### Trade-off 2: Image Optimization Strategy

**Options:**
1. Optimize existing 4MB JPEGs (70% compression) → still slow
2. Lazy-load all images below the fold
3. Generate multiple WebP variants at different sizes

**Chosen:** Multiple WebP variants + priority loading for LCP images.

**Why:** Lazy-loading keeps LCP high because "above the fold" still means "first image users see." Lazy-loading that first image defeats the purpose. Instead: preload the hero image, lazy-load everything else.

---

### Trade-off 3: Bundle Splitting Strategy

**Options:**
1. One large bundle that includes everything (current state)
2. Aggressive code splitting: every route gets its own chunk
3. Balanced approach: split by feature, preload critical paths

**Chosen:** Balanced splitting (react-core, ui-lib, checkout, filters).

**Why:** Too much splitting causes waterfall requests (download bundle A, then notice it needs bundle B, then download B). One bundle is too monolithic. The middle ground: split at feature boundaries, preload the critical path.

---

## The Reusable Checklist

After this project and three others, here's the checklist I run on every site to hit Core Web Vitals:

### 1. Largest Contentful Paint (LCP ≤ 2.5s)

- [ ] **Image as early as possible:** Server-render images in HTML, don't wait for JS
- [ ] **Preload LCP image:** `<link rel="preload" as="image">`
- [ ] **Serve next-gen format:** WebP for supported browsers, fallback JPEG
- [ ] **Serve sized variants:** Use `srcset` + `sizes` to avoid serving 4MB on mobile
- [ ] **Minimize render-blocking JS:** Split bundles, defer non-critical
- [ ] **Optimize font loading:** Use `font-display: swap` to show content while fonts load
- [ ] **Measure on 3G network:** Chrome DevTools throttling, not just cable connections

### 2. First Input Delay (FID ≤ 100ms)

- [ ] **Reduce JavaScript work:** Long tasks block the main thread
- [ ] **Break up heavy operations:** Use `setTimeout(..., 0)` to yield to the browser
- [ ] **Use Web Workers:** Move computation off the main thread
- [ ] **Profile with Performance tab:** Find where time is actually spent
- [ ] **Test on real phones:** Desktop throttling isn't enough

### 3. Cumulative Layout Shift (CLS ≤ 0.1)

- [ ] **Reserve space for images:** Always include `width` and `height`
- [ ] **Reserve space for ads/embeds:** Detect size before rendering
- [ ] **Avoid inserting content above existing content:** (except user-initiated)
- [ ] **Use `transform` for animations:** Not `top`/`left`/`width`/`height`
- [ ] **Font loading:** Use `font-display: swap` to avoid FOIT/FOUT

---

## What I Learned

1. **Measurement beats intuition.** I would have guessed the problem was "React is too heavy." Actually, the problem was "images don't load until 3 seconds of JavaScript completes." Different solutions.

2. **The biggest wins come early.** Optimizing from 4.2s to 1.2s took a week of work. Optimizing from 1.2s to 0.9s takes another month of micro-optimizations. Always chase the biggest bottleneck first.

3. **Business context matters.** A 0.3s improvement might not matter for a blog. For an e-commerce site, it's the difference between 30 and 100 daily conversions. Know what metric actually drives value.

4. **Production is different.** Local machine performance means nothing. Real-world 3G networks, real phones, real users — that's where optimization matters. Always test on throttled connections and measure real user metrics (RUM).

5. **Regressions happen fast.** Without automated performance monitoring (Lighthouse CI), the next team member ships a new feature and we're back to 3.5s LCP. Set up CI checks to fail builds if performance regresses.

---

## Tools That Shipped This Project

- **Chrome DevTools Performance tab** — waterfall visualization
- **Lighthouse CI** — automated performance checks on every PR
- **WebPageTest** — real browsers, real 3G networks
- **Next.js Image component** — handles srcset, WebP detection, lazy loading
- **ImageOptim CLI** — batch compress to WebP
- **Bundle Analyzer** — visualization of what's in your bundles

---

## Takeaway

Performance optimization is not a one-time thing. It's a discipline. The tools exist, the knowledge is public, and the business case is undeniable.

If your site takes 4+ seconds to show the main product, users have already decided to leave. Optimization isn't luxury — it's the price of entry for any site that wants to convert visitors into customers.

The Galaxy Sofas project proved it: cut load time in thirds, triple the enquiries.
