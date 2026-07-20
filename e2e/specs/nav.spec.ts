import { test, expect } from '../fixtures';
import { NavigationComponent } from '../pages';

/**
 * Primary nav lives in the sidebar (static on desktop, a drawer on mobile).
 * On mobile viewports the links are hidden until the hamburger is tapped, so we
 * open the drawer first when the menu button is showing.
 */
async function openNavIfMobile(nav: NavigationComponent): Promise<boolean> {
  if (await nav.menuButton.isVisible()) {
    await nav.openMobileMenu();
    return true;
  }
  return false;
}

test.describe('Navigation & Layout', () => {
  test('primary nav links route to the correct pages', async ({ page }) => {
    const nav = new NavigationComponent(page);
    await page.goto('/');

    const routes: Array<{ label: string; path: RegExp }> = [
      { label: 'About', path: /\/about$/ },
      { label: 'Projects', path: /\/projects$/ },
      { label: 'Skills', path: /\/skills$/ },
      { label: 'Contact', path: /\/contact$/ },
    ];

    for (const { label, path } of routes) {
      await openNavIfMobile(nav);
      await nav.goToSection(label, path);
    }
  });

  test('mobile hamburger opens and closes the drawer', async ({ page }) => {
    const nav = new NavigationComponent(page);
    await page.goto('/');

    // Desktop keeps the sidebar static and hides the hamburger — nothing to test.
    test.skip(!(await nav.menuButton.isVisible()), 'hamburger only exists on mobile');

    await nav.openMobileMenu();
    await expect(nav.sidebar).toHaveClass(/shell__sidebar--open|sb/);
    await expect(nav.navLink('Projects')).toBeVisible();

    await nav.closeMobileMenu();
    await expect(nav.menuBackdrop).toHaveCount(0);
  });

  test('sidebar social links have href and open in a new tab', async ({ page }) => {
    const nav = new NavigationComponent(page);
    await page.goto('/');

    const count = await nav.socialLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = nav.socialLinks.nth(i);
      await expect(link).toHaveAttribute('href', /.+/);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
  });
});
