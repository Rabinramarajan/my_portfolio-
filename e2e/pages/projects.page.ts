import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export type ProjectFilter = 'All Projects' | 'Finished' | 'Upcoming';

/** Projects / portfolio route ('/projects'). */
export class ProjectsPage extends BasePage {
  readonly path = '/projects';

  /** The status-filter tab group. */
  readonly filterTabs: Locator;
  /** All rendered project cards (finished + upcoming). */
  readonly projectCards: Locator;
  /** The sort `<select>`. */
  readonly sortSelect: Locator;

  constructor(page: Page) {
    super(page);
    this.filterTabs = page.getByRole('group', { name: 'Filter projects by status' });
    this.projectCards = page.getByTestId('project-card');
    this.sortSelect = page.getByRole('combobox');
  }

  /**
   * The status filter is a `<button>` with an Angular `(click)` handler — a
   * pre-hydration click is dropped, so wait for hydration before interacting
   * (see {@link BasePage.waitForHydrated}).
   */
  override async waitForPageReady(): Promise<void> {
    await super.waitForPageReady();
    await this.waitForHydrated();
  }

  filterTab(name: ProjectFilter): Locator {
    return this.filterTabs.getByRole('button', { name, exact: false });
  }

  /** A project card by its title heading. */
  cardByTitle(title: string): Locator {
    return this.projectCards.filter({ has: this.page.getByRole('heading', { name: title }) });
  }

  /**
   * Apply a status filter and wait for the tab to report itself pressed.
   *
   * The tab is a `<button>` whose `(click)` is dropped if it fires before Angular
   * hydrates (webkit hydrates after `networkidle` resolves), so the click is
   * retried until `aria-pressed` actually flips.
   */
  async setFilter(name: ProjectFilter): Promise<void> {
    const tab = this.filterTab(name);
    await expect(async () => {
      await tab.click();
      await expect(tab).toHaveAttribute('aria-pressed', 'true');
    }).toPass({ timeout: 20_000 });
  }

  async sortBy(optionLabel: string): Promise<void> {
    await this.sortSelect.selectOption({ label: `Sort by: ${optionLabel}` });
  }

  async visibleCardCount(): Promise<number> {
    return this.projectCards.count();
  }
}
