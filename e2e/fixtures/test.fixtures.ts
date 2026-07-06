import { test as base } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { BlogPage } from '../pages/blog.page';
import { BlogDetailPage } from '../pages/blog-detail.page';
import { ProjectDetailPage } from '../pages/project-detail.page';
import { HireMePage } from '../pages/hire-me.page';
import { StyleguidePage } from '../pages/styleguide.page';
import { collectConsoleErrors, type ConsoleErrorCollector } from '../utils/console.utils';

export { expect } from '../assertions/custom-assertions';

/**
 * Central test fixture. Import { test, expect } from here in every spec —
 * page objects arrive pre-wired and the console collector is attached before
 * any navigation.
 */
interface Fixtures {
  homePage: HomePage;
  blogPage: BlogPage;
  blogDetailPage: BlogDetailPage;
  projectDetailPage: ProjectDetailPage;
  hireMePage: HireMePage;
  styleguidePage: StyleguidePage;
  consoleErrors: ConsoleErrorCollector;
}

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => use(new HomePage(page)),
  blogPage: async ({ page }, use) => use(new BlogPage(page)),
  blogDetailPage: async ({ page }, use) => use(new BlogDetailPage(page)),
  projectDetailPage: async ({ page }, use) => use(new ProjectDetailPage(page)),
  hireMePage: async ({ page }, use) => use(new HireMePage(page)),
  styleguidePage: async ({ page }, use) => use(new StyleguidePage(page)),
  consoleErrors: async ({ page }, use) => use(collectConsoleErrors(page)),
});
