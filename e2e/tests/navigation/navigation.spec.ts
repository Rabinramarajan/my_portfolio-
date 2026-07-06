import { test, expect } from '../../fixtures/test.fixtures';
import { BLOG_SLUGS, PROJECT_SLUGS } from '../../data/test-data';

/**
 * @regression — header navigation, mobile menu, deep-linking.
 * Nav links are data-driven (public/portfolio-data.json): in-page anchors +
 * /blog + external LinkedIn. Mobile layout engages below 860px (header.scss),
 * so mobile tests run at 375px.
 */

test.describe('Header navigation @regression', () => {
  test('in-page anchor links update the URL hash and reveal their section', async ({ homePage, page }) => {
    await homePage.goto();

    const anchors = [
      { label: 'About', id: 'about' },
      { label: 'Experience', id: 'experience' },
      { label: 'Skills', id: 'skills' },
      { label: 'Projects', id: 'projects' },
      { label: 'Contact', id: 'contact' },
    ];

    for (const { label, id } of anchors) {
      const link = homePage.header.desktopLink(label);
      await expect(link, `nav link "${label}" should exist`).toHaveAttribute('href', `#${id}`);

      await link.click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
  });

  test('the "Blog" link routes to the /blog page', async ({ homePage, page }) => {
    await homePage.goto();

    const blogLink = homePage.header.desktopLink('Blog');
    await expect(blogLink).toHaveAttribute('href', '/blog');

    await blogLink.click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('the external LinkedIn link opens in a new tab', async ({ homePage }) => {
    await homePage.goto();

    const linkedin = homePage.header.desktopLink('LinkedIn');
    await expect(linkedin).toHaveAttribute('href', /linkedin\.com/);
    await expect(linkedin).toHaveAttribute('target', '_blank');
  });

  // KNOWN BUG: the scroll-spy never activates. Header.setupScrollSpy() runs in
  // afterNextRender() before the routed Home sections mount, so getElementById
  // returns null and the observer bails (header.ts). `nav-link--active` /
  // aria-current are never applied. Remove `.fixme` once the observer is
  // (re)initialised after the sections exist.
  test.fixme('the active-link class follows the section in view (scroll-spy)', async ({ homePage }) => {
    await homePage.goto();

    await homePage.centerSection('skills');
    await expect(homePage.header.activeLink).toHaveText('Skills');
    await expect(homePage.header.activeLink).toHaveAttribute('aria-current', 'true');

    await homePage.centerSection('about');
    await expect(homePage.header.activeLink).toHaveText('About');
  });
});

test.describe('Mobile menu (375px) @regression', () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test('the hamburger opens and closes the mobile dropdown', async ({ homePage }) => {
    await homePage.goto();
    const { header } = homePage;

    await expect(header.navMenu).toBeHidden();
    await expect(header.toggle).toHaveAttribute('aria-expanded', 'false');

    await header.openMobileMenu();
    await expect(header.mobileMenu).toHaveClass(/open/);
    await expect(header.backdrop).toHaveClass(/show/);
    await expect(header.toggle).toHaveAttribute('aria-expanded', 'true');

    await header.openMobileMenu(); // toggle closed
    await expect(header.mobileMenu).not.toHaveClass(/open/);
    await expect(header.toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('tapping the backdrop closes the mobile menu', async ({ homePage }) => {
    await homePage.goto();
    await homePage.header.openMobileMenu();
    await expect(homePage.header.mobileMenu).toHaveClass(/open/);

    // The open dropdown covers the top of the backdrop — click low, below the menu.
    await homePage.header.backdrop.click({ position: { x: 20, y: 760 } });
    await expect(homePage.header.mobileMenu).not.toHaveClass(/open/);
  });

  test('choosing a mobile link closes the menu and navigates', async ({ homePage, page }) => {
    await homePage.goto();
    await homePage.header.openMobileMenu();

    await homePage.header.mobileLink('Blog').click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(homePage.header.mobileMenu).not.toHaveClass(/open/);
  });
});

test.describe('Deep-linking @regression', () => {
  test('/blog/:slug renders the article (no blank / 404 redirect)', async ({ blogDetailPage, page }) => {
    await blogDetailPage.gotoSlug(BLOG_SLUGS.markdownArticle);

    // The catch-all route redirects unknown paths home — the slug must survive.
    await expect(page).toHaveURL(new RegExp(`/blog/${BLOG_SLUGS.markdownArticle}$`));
    await expect(blogDetailPage.title).toBeVisible();
    await expect(blogDetailPage.title).not.toBeEmpty();
  });

  test('/projects/:slug renders the case study (no blank / 404 redirect)', async ({ projectDetailPage, page }) => {
    await projectDetailPage.gotoSlug(PROJECT_SLUGS.caseStudy);

    await expect(page).toHaveURL(new RegExp(`/projects/${PROJECT_SLUGS.caseStudy}$`));
    await expect(projectDetailPage.title).toBeVisible();
    await expect(projectDetailPage.title).not.toBeEmpty();
  });

  test('unknown blog slug shows the not-found state', async ({ blogDetailPage }) => {
    await blogDetailPage.gotoSlug('this-slug-does-not-exist');
    await expect(blogDetailPage.notFoundTitle).toBeVisible();
  });
});
