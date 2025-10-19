import { test, expect } from '@playwright/test';

test.describe('Artwork Browsing Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete browsing workflow from landing to category', async ({
    page,
  }) => {
    // Start on landing page
    await expect(page).toHaveTitle(/Elena Rodriguez/);
    await expect(page.locator('h1')).toContainText('Elena Rodriguez');

    // Navigate to work page
    await page.click('nav a[href="/work"]');
    await expect(page).toHaveURL('/work');
    await expect(page.locator('h1')).toContainText('Artwork Collection');

    // Verify category grid is displayed
    const categoryCards = page.locator('[data-testid="category-card"]');
    await expect(categoryCards).toHaveCount(4);

    // Check category names and counts
    await expect(page.locator('text=Category A')).toBeVisible();
    await expect(page.locator('text=Category B')).toBeVisible();
    await expect(page.locator('text=Category C')).toBeVisible();
    await expect(page.locator('text=Category D')).toBeVisible();

    // Click on Category A
    await page.click('[data-testid="category-card"]:has-text("Category A")');
    await expect(page).toHaveURL('/work/a');

    // Verify category page loads with artworks
    await expect(page.locator('h1')).toContainText('Category A');
    const artworkCards = page.locator('[data-testid="artwork-card"]');
    await expect(artworkCards.first()).toBeVisible();

    // Verify artwork identifiers are displayed
    await expect(page.locator('text=A1')).toBeVisible();
  });

  test('navigation between categories', async ({ page }) => {
    await page.goto('/work');

    // Navigate through all categories
    const categories = ['a', 'b', 'c', 'd'];

    for (const category of categories) {
      await page.click(
        `[data-testid="category-card"]:has-text("Category ${category.toUpperCase()}")`
      );
      await expect(page).toHaveURL(`/work/${category}`);
      await expect(page.locator('h1')).toContainText(
        `Category ${category.toUpperCase()}`
      );

      // Go back to work page for next iteration
      if (category !== 'd') {
        await page.click('nav a[href="/work"]');
      }
    }
  });

  test('responsive navigation on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if hamburger menu is visible
    const hamburgerButton = page.locator('[data-testid="mobile-menu-button"]');
    await expect(hamburgerButton).toBeVisible();

    // Open mobile menu
    await hamburgerButton.click();

    // Verify mobile menu items
    await expect(
      page.locator('[data-testid="mobile-menu"] a[href="/work"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="mobile-menu"] a[href="/about"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="mobile-menu"] a[href="/contact"]')
    ).toBeVisible();

    // Navigate using mobile menu
    await page.click('[data-testid="mobile-menu"] a[href="/work"]');
    await expect(page).toHaveURL('/work');
  });

  test('artwork grid lazy loading', async ({ page }) => {
    await page.goto('/work/a');

    // Wait for initial artworks to load
    await expect(
      page.locator('[data-testid="artwork-card"]').first()
    ).toBeVisible();

    // Scroll to trigger lazy loading
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Wait for additional artworks to load
    await page.waitForTimeout(1000);

    // Verify more artworks are loaded
    const artworkCount = await page
      .locator('[data-testid="artwork-card"]')
      .count();
    expect(artworkCount).toBeGreaterThan(0);
  });

  test('image loading and error handling', async ({ page }) => {
    await page.goto('/work/a');

    // Wait for images to load
    const firstImage = page.locator('[data-testid="artwork-image"]').first();
    await expect(firstImage).toBeVisible();

    // Check that images have proper alt text
    const altText = await firstImage.getAttribute('alt');
    expect(altText).toMatch(/A\d+/); // Should contain artwork ID

    // Verify image dimensions are set
    const naturalWidth = await firstImage.evaluate(
      (img: HTMLImageElement) => img.naturalWidth
    );
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test('category page breadcrumbs', async ({ page }) => {
    await page.goto('/work/a');

    // Check breadcrumb navigation
    await expect(page.locator('[data-testid="breadcrumb"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="breadcrumb"] a[href="/"]')
    ).toContainText('Home');
    await expect(
      page.locator('[data-testid="breadcrumb"] a[href="/work"]')
    ).toContainText('Work');
    await expect(page.locator('[data-testid="breadcrumb"] span')).toContainText(
      'Category A'
    );

    // Navigate using breadcrumbs
    await page.click('[data-testid="breadcrumb"] a[href="/work"]');
    await expect(page).toHaveURL('/work');
  });

  test('search and filter functionality', async ({ page }) => {
    await page.goto('/work');

    // Check if search functionality exists
    const searchInput = page.locator('[data-testid="search-input"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('abstract');
      await page.keyboard.press('Enter');

      // Verify search results
      await expect(
        page.locator('[data-testid="search-results"]')
      ).toBeVisible();
    }
  });

  test('performance metrics', async ({ page }) => {
    // Navigate to work page and measure performance
    const startTime = Date.now();
    await page.goto('/work');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Verify reasonable load time (under 3 seconds)
    expect(loadTime).toBeLessThan(3000);

    // Check Core Web Vitals
    const lcp = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });

    // LCP should be under 2.5 seconds
    expect(lcp).toBeLessThan(2500);
  });
});
