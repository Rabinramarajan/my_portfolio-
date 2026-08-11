import { chromium } from 'playwright';

const BASE = 'http://localhost:4300';
const browser = await chromium.launch();
const results = [];
const check = (name, pass, detail = '') =>
  results.push({ name, pass, detail: String(detail).slice(0, 140) });

async function newPage(width, height, opts = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    hasTouch: opts.touch ?? false,
    isMobile: opts.mobile ?? false,
    reducedMotion: opts.reducedMotion ?? 'no-preference',
  });
  const page = await ctx.newPage();
  return { page, ctx };
}

async function gotoAndSettle(page, path, settleMs = 4000) {
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  // The cinematic loader must fully exit before interactivity is reliable.
  await page.waitForFunction(
    () => {
      const l = document.querySelector('.loader');
      return !l || getComputedStyle(l).display === 'none' || l.getAttribute('aria-hidden') === 'true';
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(settleMs);
}

// ---------------------------------------------------------------------------
// 1) HEADER — CTA visibility by breakpoint
// ---------------------------------------------------------------------------
{
  for (const [w, h] of [[320, 568], [390, 844], [768, 1024], [1024, 1366], [1280, 720]]) {
    const { page, ctx } = await newPage(w, h);
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const cta = await page.locator('.hd__cta').evaluate((el) => window.getComputedStyle(el).display);
    const nav = await page.locator('.hd__nav').evaluate((el) => window.getComputedStyle(el).display);
    const toggle = await page.locator('.hd__toggle').evaluate((el) => window.getComputedStyle(el).display);
    const expectCta = w >= 1024 ? 'block' : 'none';
    const expectNav = w >= 1024 ? 'block' : 'none';
    const expectToggle = w >= 1024 ? 'none' : 'grid';
    check(
      `header: cta ${w}px`,
      cta === expectCta && nav === expectNav && toggle === expectToggle,
      `cta=${cta} nav=${nav} toggle=${toggle} (expect cta=${expectCta} nav=${expectNav} toggle=${expectToggle})`,
    );
    // header no overflow of inner content
    const overflow = await page.evaluate(() => {
      const hd = document.querySelector('.hd__inner');
      const r = hd.getBoundingClientRect();
      return { l: r.left, r: r.right, inner: window.innerWidth };
    });
    check(`header: fits ${w}px`, overflow.l >= 0 && overflow.r <= overflow.inner, JSON.stringify(overflow));
    await ctx.close();
  }
}

// ---------------------------------------------------------------------------
// 2) HERO — meta columns, heading fit, actions, touch targets
// ---------------------------------------------------------------------------
for (const [w, h] of [[320, 568], [390, 844], [412, 915], [768, 1024], [1024, 1366]]) {
  const { page, ctx } = await newPage(w, h);
  await gotoAndSettle(page, '/', 2000);

  const metaCols = await page.locator('.hero__meta').evaluate((el) => {
    const gtc = window.getComputedStyle(el).gridTemplateColumns;
    return gtc.split(' ').length;
  });
  check(`hero: meta columns ${w}px`, w < 768 ? metaCols === 1 : metaCols === 3, `cols=${metaCols}`);

  const heading = await page.locator('.hero__heading').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { fs: window.getComputedStyle(el).fontSize, l: Math.round(r.left), r: Math.round(r.right), inner: window.innerWidth };
  });
  check(`hero: heading fits ${w}px`, heading.l >= 0 && heading.r <= heading.inner, JSON.stringify(heading));

  const btns = await page.locator('.hero__actions .btn').evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) };
    }),
  );
  const primary = btns[0];
  check(`hero: primary cta touch target ${w}px`, primary && primary.h >= 44, JSON.stringify(btns));
  // Buttons should not overlap each other
  let overlap = false;
  for (let i = 0; i < btns.length - 1; i++) {
    const a = btns[i], b = btns[i + 1];
    const sameRow = Math.abs(a.top - b.top) < 10;
    if (sameRow && b.l < a.r) overlap = true;
  }
  check(`hero: cta no overlap ${w}px`, !overlap, JSON.stringify(btns));

  const statusPill = await page.locator('.hero__status').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), l: Math.round(r.left), r: Math.round(r.right), inner: window.innerWidth };
  });
  check(`hero: status pill fits ${w}px`, statusPill.l >= 0 && statusPill.r <= statusPill.inner, JSON.stringify(statusPill));

  await ctx.close();
}

// ---------------------------------------------------------------------------
// 3) MOBILE MENU — ESC, focus trap, focus restore, CTA present
// ---------------------------------------------------------------------------
{
  const { page, ctx } = await newPage(390, 844, { touch: true, mobile: true });
  await gotoAndSettle(page, '/', 2000);

  const toggle = page.getByRole('button', { name: /open menu/i });
  await toggle.click();
  await page.waitForTimeout(700);
  const menuVisible = await page.locator('#mobile-menu').evaluate((el) => window.getComputedStyle(el).visibility === 'visible');
  check('menu: opens', menuVisible);

  const hasWorkTogether = await page.locator('#mobile-menu').getByText(/let's work together/i).count();
  check('menu: has Let\'s Work Together CTA', hasWorkTogether > 0);

  // ESC closes
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1400);
  const closedByEsc = await page.locator('#mobile-menu').evaluate((el) => window.getComputedStyle(el).visibility === 'hidden');
  check('menu: ESC closes', closedByEsc);
  const focusBack = await toggle.evaluate((el) => el === document.activeElement);
  check('menu: focus restored to toggle', focusBack);

  // Focus trap: reopen and Tab around
  await toggle.click();
  await page.waitForTimeout(700);
  await page.keyboard.press('Tab');
  await page.waitForTimeout(100);
  const inMenu = await page.evaluate(() => document.querySelector('#mobile-menu').contains(document.activeElement));
  check('menu: focus trapped after Tab', inMenu);

  await ctx.close();
}

// ---------------------------------------------------------------------------
// 4) ABOUT — portrait fit, principles, timeline breakpoint
// ---------------------------------------------------------------------------
{
  const { page, ctx } = await newPage(390, 844);
  await gotoAndSettle(page, '/', 2000);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.3));
  await page.waitForTimeout(800);

  const portrait = await page.locator('.about-portrait__frame').evaluate((el) => {
    const r = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    return { w: Math.round(r.width), h: Math.round(r.height), ratio: (r.width / r.height).toFixed(2), asp: cs.aspectRatio, inner: window.innerWidth };
  });
  check('about: portrait ratio mobile', Math.abs(parseFloat(portrait.ratio) - 0.8) < 0.02, JSON.stringify(portrait));
  check('about: portrait fits mobile', portrait.w <= portrait.inner, JSON.stringify(portrait));

  const timelineCols = await page.locator('.timeline__track').evaluate((el) => window.getComputedStyle(el).gridTemplateColumns.split(' ').length);
  check('about: career timeline single-col mobile', timelineCols === 1, `cols=${timelineCols}`);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 5) SERVICES / WORK / PROCESS behavior on mobile
// ---------------------------------------------------------------------------
{
  const { page, ctx } = await newPage(390, 844);
  await gotoAndSettle(page, '/', 2000);

  // Services row: header grid must fit
  const svHead = await page.locator('.sv__head').first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { l: Math.round(r.left), r: Math.round(r.right), inner: window.innerWidth };
  });
  check('services: head fits mobile', svHead.l >= 0 && svHead.r <= svHead.inner, JSON.stringify(svHead));

  // Process visual hidden on mobile
  const pvDisplay = await page.locator('.pr__visual').evaluate((el) => window.getComputedStyle(el).display);
  check('process: visual hidden on mobile', pvDisplay === 'none', `display=${pvDisplay}`);

  // Process rail line on mobile
  const stepCols = await page.locator('.pr__step').first().evaluate((el) => window.getComputedStyle(el).gridTemplateColumns);
  check('process: step layout mobile', stepCols.includes('40px'), stepCols);

  // Work cards image aspect reserved (CLS)
  const cardMedia = await page.locator('.pc__media').first().evaluate((el) => {
    const img = el.querySelector('img');
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), ratio: img ? (r.width / r.height).toFixed(2) : 'noimg' };
  });
  check('work: card media has ratio', parseFloat(cardMedia.ratio) > 0, JSON.stringify(cardMedia));

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.9));
  await page.waitForTimeout(600);
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 6) CONTACT — form field heights, labels, keyboard types
// ---------------------------------------------------------------------------
{
  const { page, ctx } = await newPage(390, 844);
  await gotoAndSettle(page, '/contact', 2000);
  await page.evaluate(() => document.querySelector('#start-project')?.scrollIntoView());
  await page.waitForTimeout(500);

  const email = page.locator('#email');
  check('contact: email type', (await email.getAttribute('type')) === 'email');
  check('contact: email autocomplete', (await email.getAttribute('autocomplete')) === 'email');
  const nameAuto = await page.locator('#name').getAttribute('autocomplete');
  check('contact: name autocomplete', nameAuto === 'name');

  const fieldHeights = await page.locator('.ct__field input').first().evaluate((el) => el.getBoundingClientRect().height);
  check('contact: input height >= 44', fieldHeights >= 44, `h=${Math.round(fieldHeights)}`);

  // Labels visible (not placeholder-only)
  const labelVisible = await page.locator('label[for="name"]').isVisible();
  check('contact: labels visible', labelVisible);

  const heroStatus = await page.locator('.ct__hero-status').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { l: Math.round(r.left), r: Math.round(r.right), inner: window.innerWidth, h: Math.round(r.height) };
  });
  check('contact: hero status pill fits', heroStatus.l >= 0 && heroStatus.r <= heroStatus.inner, JSON.stringify(heroStatus));

  await ctx.close();
}

// ---------------------------------------------------------------------------
// 7) CASE STUDY — hero media ratio, meta grid, no overflow of prose
// ---------------------------------------------------------------------------
{
  const { page, ctx } = await newPage(390, 844);
  await gotoAndSettle(page, '/work/fiji-immigration-external', 2000);

  const heroMedia = await page.locator('.cs__hero-media').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), ratio: (r.width / r.height).toFixed(2), inner: window.innerWidth };
  });
  check('case: hero media fits', heroMedia.w <= heroMedia.inner && heroMedia.w > 0, JSON.stringify(heroMedia));

  const crumb = await page.locator('.cs__crumbs').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { l: Math.round(r.left), r: Math.round(r.right), inner: window.innerWidth };
  });
  check('case: breadcrumb fits', crumb.l >= 0 && crumb.r <= crumb.inner, JSON.stringify(crumb));

  const title = await page.locator('.cs__title').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { fs: window.getComputedStyle(el).fontSize, r: Math.round(r.right), inner: window.innerWidth };
  });
  check('case: title fits', title.r <= title.inner, JSON.stringify(title));

  await ctx.close();
}

// ---------------------------------------------------------------------------
// 8) REDUCED MOTION — reveals not hidden
// ---------------------------------------------------------------------------
{
  const { page, ctx } = await newPage(390, 844, { reducedMotion: 'reduce' });
  await gotoAndSettle(page, '/', 2000);
  const hidden = await page.evaluate(() => {
    const revealed = document.querySelectorAll('[data-reveal]:not([data-revealed])');
    const visibleHidden = [...revealed].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
    });
    return visibleHidden.length;
  });
  check('reduced-motion: no hidden reveal targets in viewport', hidden === 0, `hidden=${hidden}`);
  await ctx.close();
}

// ---------------------------------------------------------------------------
// Print report
// ---------------------------------------------------------------------------
let fail = 0;
for (const r of results) {
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.pass ? '' : '  ->  ' + r.detail}`);
  if (!r.pass) fail++;
}
console.log(`\n${results.length - fail}/${results.length} passed`);
await browser.close();
process.exit(0);
