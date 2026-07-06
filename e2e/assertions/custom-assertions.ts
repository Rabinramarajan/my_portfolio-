import { expect as baseExpect, type Page } from '@playwright/test';

/**
 * Custom matchers. Import `expect` from the fixtures module (which re-exports
 * this) so all specs share them.
 */
export const expect = baseExpect.extend({
  /** Asserts the document does not scroll horizontally (1px sub-pixel tolerance). */
  async toHaveNoHorizontalOverflow(page: Page) {
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    const pass = scrollWidth <= clientWidth + 1;
    return {
      pass,
      message: () =>
        pass
          ? `expected horizontal overflow, but none found`
          : `horizontal overflow: scrollWidth ${scrollWidth} > clientWidth ${clientWidth}`,
    };
  },
});
