import { test, expect } from '../fixtures';
import { ProjectsPage } from '../pages';

test.describe('Projects', () => {
  let projects: ProjectsPage;

  test.beforeEach(async ({ page }) => {
    projects = new ProjectsPage(page);
    await projects.navigateTo();
  });

  test('project cards render with a title', async () => {
    expect(await projects.projectCards.count()).toBeGreaterThan(0);
    const firstCard = projects.projectCards.first();
    await expect(firstCard.getByRole('heading')).toBeVisible();
  });

  test('external project links open in a new tab', async ({ page }) => {
    // Code/live links are optional per project; assert on any that render.
    const externalLinks = page.locator('[data-testid="project-card"] a[target="_blank"]');
    const count = await externalLinks.count();
    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i);
      await expect(link).toHaveAttribute('href', /^https?:\/\//);
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
  });

  test('status filter narrows the visible sections', async ({ page }) => {
    const finishedHeading = page.getByRole('heading', { name: 'Finished Projects' });
    const upcomingHeading = page.getByRole('heading', { name: 'Upcoming Projects' });

    await projects.setFilter('Finished');
    await expect(finishedHeading).toBeVisible();
    await expect(upcomingHeading).toHaveCount(0);

    await projects.setFilter('Upcoming');
    await expect(upcomingHeading).toBeVisible();
    await expect(finishedHeading).toHaveCount(0);

    await projects.setFilter('All Projects');
    await expect(finishedHeading).toBeVisible();
    await expect(upcomingHeading).toBeVisible();
  });
});
