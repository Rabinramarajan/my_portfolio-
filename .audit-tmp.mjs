import { chromium, devices } from '@playwright/test';
import fs from 'node:fs';

const BASE = 'http://localhost:4321';
const routes = ['/', '/work', '/resume', '/contact', '/no-such-page'];
const viewports = [
  { name: 'mobile-360', width: 360, height: 740 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1280', width: 1280, height: 800 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
];

const OUT = process.argv[2] || '.';
const report = [];

const browser = await chromium.launch();
for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: vp.width < 768,
    hasTouch: vp.width < 768,
    userAgent: vp.width < 768 ? devices['iPhone 14'].userAgent : undefined,
  });
  for (const route of routes) {
    const entry = { viewport: vp.name, route, console: [], pageErrors: [], failedRequests: [] };
    const page = await ctx.newPage();
    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning')
        entry.console.push(`${m.type()}: ${m.text().slice(0, 300)}`);
    });
    page.on('pageerror', (e) => entry.pageErrors.push(String(e).slice(0, 300)));
    page.on('requestfailed', (r) =>
      entry.failedRequests.push(`${r.url().slice(0, 160)} :: ${r.failure()?.errorText}`),
    );
    page.on('response', (r) => {
      if (r.status() >= 400)
        entry.failedRequests.push(`HTTP ${r.status()} ${r.url().slice(0, 160)}`);
    });

    const t0 = Date.now();
    let resp;
    try {
      resp = await page.goto(BASE + route, { waitUntil: 'load', timeout: 60000 });
      await page.waitForTimeout(2500);
    } catch (e) {
      entry.navError = String(e).slice(0, 300);
    }
    entry.status = resp?.status();
    entry.loadMs = Date.now() - t0;

    try {
      entry.audit = await page.evaluate(() => {
        const docW = document.documentElement.clientWidth;
        const out = { docW, scrollW: document.documentElement.scrollWidth, overflow: [], tinyTap: [], contrastless: [], imgNoAlt: 0, headings: [], title: document.title, h1: [] };
        const els = Array.from(document.querySelectorAll('body *'));
        for (const el of els) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (r.right > docW + 1 || r.left < -1) {
            const cs = getComputedStyle(el);
            if (cs.position === 'fixed' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
            out.overflow.push({
              tag: el.tagName.toLowerCase(),
              cls: (el.className || '').toString().slice(0, 60),
              left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width),
            });
          }
          if (/^(a|button)$/i.test(el.tagName) && (r.width < 40 || r.height < 32)) {
            out.tinyTap.push({ tag: el.tagName.toLowerCase(), text: (el.textContent || '').trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) });
          }
        }
        out.overflow = out.overflow.slice(0, 12);
        out.tinyTap = out.tinyTap.slice(0, 10);
        out.imgNoAlt = document.querySelectorAll('img:not([alt])').length;
        out.h1 = Array.from(document.querySelectorAll('h1')).map((h) => h.textContent.trim().slice(0, 60));
        out.headings = Array.from(document.querySelectorAll('h1,h2,h3,h4')).map((h) => h.tagName + ':' + h.textContent.trim().slice(0, 40)).slice(0, 25);
        out.metaDesc = document.querySelector('meta[name="description"]')?.content?.slice(0, 120) || null;
        out.canonical = document.querySelector('link[rel=canonical]')?.href || null;
        out.bodyText = document.body.innerText.replace(/\s+/g, ' ').slice(0, 200);
        return out;
      });
    } catch (e) {
      entry.evalError = String(e).slice(0, 200);
    }

    try {
      await page.screenshot({ path: `${OUT}/${vp.name}${route.replace(/\//g, '_')}.png`, fullPage: true });
    } catch {}
    report.push(entry);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log('done');
