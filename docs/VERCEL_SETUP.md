# Vercel Integration Setup

This document outlines the Vercel integrations set up for the portfolio project to enable analytics, performance monitoring, OG image generation, and optimized deployment.

## Components Installed

### 1. **Vercel Analytics** (`@vercel/analytics@2.0.1`)

Tracks user behavior and engagement metrics automatically on Vercel-hosted applications.

**What it does:**

- Automatically tracks page views and custom events
- Sends data to Vercel's analytics dashboard
- Zero-configuration page view tracking

**Integration:**

- Script injected in `VercelService` at app initialization
- Auto-loads `/_vercel/insights/script.js` in production only

**Usage in components:**

```typescript
import { VercelService } from '@app/core/services';

export class MyComponent {
  constructor(private vercel: VercelService) {}

  trackEvent() {
    // Custom events can be tracked via the VA global
    window.va?.('event', { name: 'custom_action' });
  }
}
```

### 2. **Web Vitals** (`web-vitals@5.3.0`)

Tracks Core Web Vitals and Performance metrics automatically.

**Metrics tracked:**

- **CLS** (Cumulative Layout Shift) - Visual stability
- **FCP** (First Contentful Paint) - Perceived load speed
- **LCP** (Largest Contentful Paint) - Loading performance
- **TTFB** (Time to First Byte) - Server response speed
- **INP** (Interaction to Next Paint) - Responsiveness

**Integration:**

- `WebVitalsService` captures metrics and sends to Vercel's insights endpoint
- Runs in production only (`isDevMode()` check)
- Uses `navigator.sendBeacon` for reliable metric delivery

### 3. **OG Image Service** (`OGImageService`)

Manages Open Graph meta tags for social media sharing.

**Features:**

- Dynamically sets OG tags for page sharing
- Supports custom images or generates default OG images
- Twitter card support for social media previews

**Usage in components:**

```typescript
import { OGImageService } from '@app/core/services';

export class ProjectDetailComponent {
  constructor(private og: OGImageService) {}

  ngOnInit() {
    this.og.setOpenGraphTags({
      title: 'My Awesome Project',
      description: 'A project description',
      url: window.location.href,
      image: '/assets/project-og-image.png',
    });
  }
}
```

### 4. **Vercel Deployment Configuration** (`vercel.json`)

Optimized deployment settings for Vercel hosting.

**Configuration includes:**

- Build command: `ng build`
- Output directory: `dist/my-portfolio-ng22/browser`
- Clean URLs enabled (no `.html` extensions)
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Asset caching with 1-year TTL
- Environment variable support for analytics ID

## Setup Instructions

### Prerequisites

- Node.js 22.0+
- npm 11.16.0+
- Vercel account (https://vercel.com)

### Installation Steps

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Link to Vercel:**

   ```bash
   npm install -g vercel
   vercel login
   vercel link
   ```

3. **Configure Vercel Analytics:**
   - Go to your project dashboard on vercel.com
   - Navigate to Settings → Analytics
   - Enable Web Analytics
   - Copy your Analytics ID

4. **Set environment variable:**

   ```bash
   vercel env add VERCEL_ANALYTICS_ID
   # Paste your Analytics ID when prompted
   ```

5. **Deploy:**
   ```bash
   vercel deploy --prod
   ```

## Monitoring & Dashboard

### Vercel Analytics Dashboard

- **URL**: https://vercel.com/dashboard
- **Metrics**: Page views, referrers, top pages, browser stats
- **Realtime**: Live visitor tracking

### Web Vitals Insights

- **Location**: Vercel project → Analytics → Web Vitals
- **Metrics**: CLS, FCP, LCP, TTFB, INP
- **Goal**: All metrics should be in the "Good" category

### Local Development

- All tracking services are disabled in development mode
- No analytics data is sent locally
- OG image service works for meta tag testing

## Performance Optimization

### Best Practices

1. **Minimize layout shifts** - Fix CLS issues for better visual stability
2. **Optimize images** - Use modern formats (WebP) and lazy loading
3. **Code splitting** - Angular lazy loads routes automatically
4. **Caching** - Assets cached for 1 year with immutable headers

### Monitoring Alerts

- Set up alerts in Vercel dashboard for Core Web Vitals degradation
- Monitor 3xx-5xx error rates
- Track deployment frequency and duration

## Troubleshooting

### Analytics not showing data

1. Verify production build: `npm run build && vercel deploy --prod`
2. Check browser console for script loading errors
3. Ensure VERCEL_ANALYTICS_ID environment variable is set
4. Wait 5-10 minutes for data to appear in dashboard

### Web Vitals metrics are high

1. Run Lighthouse locally: `npm run build && serve dist/my-portfolio-ng22/browser`
2. Check for layout shifts using DevTools Performance tab
3. Profile with Chrome DevTools to identify bottlenecks
4. Review memory leaks in the performance recorder

### OG images not appearing on social media

1. Use og-debugger: https://www.opengraph.xyz/
2. Ensure OGImageService is called during component init
3. Verify image URLs are absolute (not relative paths)
4. Clear social media cache and retest

## Files Modified

- `package.json` - Added `web-vitals` dependency
- `src/app/app.config.ts` - Integrated Vercel services
- `src/app/core/services/vercel.service.ts` - Analytics initialization
- `src/app/core/services/web-vitals.service.ts` - Metrics tracking
- `src/app/core/services/og-image.service.ts` - OG tag management
- `vercel.json` - Deployment configuration

## Resources

- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Open Graph Protocol](https://ogp.me/)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
