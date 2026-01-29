import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('full user journey: browse, select, and inquire', async ({ page }) => {
    // Step 1: Land on homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/Prof. Zargar Zahoor/);

    // Verify landing page content
    await expect(page.locator('h1')).toContainText('Prof. Zargar Zahoor');
    await expect(page.locator('[data-testid="landing-hero"]')).toBeVisible();

    // Step 2: Navigate to About page
    await page.click('nav a[href="/about"]');
    await expect(page).toHaveURL('/about');
    await expect(page.locator('h1')).toContainText('About');

    // Verify about page content
    await expect(page.locator('[data-testid="artist-image"]')).toBeVisible();
    await expect(page.locator('[data-testid="artist-bio"]')).toBeVisible();

    // Step 3: Navigate to Work page
    await page.click('nav a[href="/work"]');
    await expect(page).toHaveURL('/work');

    // Verify category grid
    await expect(page.locator('[data-testid="category-grid"]')).toBeVisible();
    const categoryCards = page.locator('[data-testid="category-card"]');
    await expect(categoryCards).toHaveCount(4);

    // Step 4: Browse Category A
    await page.click('[data-testid="category-card"]:has-text("Category A")');
    await expect(page).toHaveURL('/work/a');

    // Wait for artworks to load
    await expect(
      page.locator('[data-testid="artwork-card"]').first()
    ).toBeVisible();

    // Step 5: View artwork in modal
    await page.click('[data-testid="artwork-card"]:first-child');
    const modal = page.locator('[data-testid="image-modal"]');
    await expect(modal).toBeVisible();

    // Verify modal content
    await expect(modal.locator('img')).toBeVisible();
    await expect(modal.locator('h2')).toBeVisible();
    await expect(modal.locator('text=A1')).toBeVisible();

    // Step 6: Add to cart from modal
    await page.click('[data-testid="modal-cart-button"]');
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '1'
    );

    // Close modal
    await page.keyboard.press('Escape');

    // Step 7: Select more artworks
    await page.click(
      '[data-testid="artwork-card"]:nth-child(2) [data-testid="select-button"]'
    );
    await page.click(
      '[data-testid="artwork-card"]:nth-child(3) [data-testid="select-button"]'
    );
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '3'
    );

    // Step 8: Browse different category
    await page.click('nav a[href="/work"]');
    await page.click('[data-testid="category-card"]:has-text("Category B")');
    await expect(page).toHaveURL('/work/b');

    // Verify cart persists
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '3'
    );

    // Add artwork from Category B
    await page.click(
      '[data-testid="artwork-card"]:first-child [data-testid="select-button"]'
    );
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '4'
    );

    // Step 9: Proceed to contact
    await page.click('[data-testid="cart-indicator"]');
    await expect(page).toHaveURL('/contact');

    // Step 10: Verify pre-filled message
    const messageField = page.locator('textarea[name="message"]');
    const messageValue = await messageField.inputValue();
    expect(messageValue).toContain(
      'I am interested in knowing the prices of the following prints:'
    );
    expect(messageValue).toMatch(/A\d+.*A\d+.*A\d+.*B\d+/); // Should contain all selected artworks

    // Step 11: Fill and submit contact form
    await page.fill('input[name="firstName"]', 'Jane');
    await page.fill('input[name="email"]', 'jane.doe@example.com');

    // Add additional message
    await page.fill(
      'textarea[name="message"]',
      messageValue +
        '\n\nI would also like to know about shipping options and framing services.'
    );

    // Mock successful form submission
    await page.route('https://api.web3forms.com/submit', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.click('button[type="submit"]');

    // Step 12: Verify success
    await expect(
      page.locator('text=Thank you for your message!')
    ).toBeVisible();
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '0'
    );

    // Step 13: Explore Press page
    await page.click('nav a[href="/press"]');
    await expect(page).toHaveURL('/press');
    await expect(page.locator('h1')).toContainText('Press');
  });

  test('mobile user journey', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Mobile landing page
    await page.goto('/');
    await expect(
      page.locator('[data-testid="mobile-menu-button"]')
    ).toBeVisible();

    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

    // Navigate to work via mobile menu
    await page.click('[data-testid="mobile-menu"] a[href="/work"]');
    await expect(page).toHaveURL('/work');

    // Mobile category selection
    await page.tap('[data-testid="category-card"]:first-child');
    await expect(page).toHaveURL('/work/a');

    // Mobile artwork selection
    await page.tap(
      '[data-testid="artwork-card"]:first-child [data-testid="select-button"]'
    );
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '1'
    );

    // Mobile modal interaction
    await page.tap('[data-testid="artwork-card"]:first-child');
    const modal = page.locator('[data-testid="image-modal"]');
    await expect(modal).toBeVisible();

    // Verify mobile modal layout
    const modalContent = modal.locator('[data-testid="modal-content"]');
    const boundingBox = await modalContent.boundingBox();
    expect(boundingBox?.width).toBeLessThan(400);

    // Close modal on mobile
    await page.tap('[data-testid="modal-close-button"]');
    await expect(modal).not.toBeVisible();

    // Mobile contact form
    await page.tap('[data-testid="cart-indicator"]');
    await expect(page).toHaveURL('/contact');

    // Verify mobile form layout
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Test mobile form interaction
    await page.tap('input[name="firstName"]');
    await page.fill('input[name="firstName"]', 'Mobile User');

    await page.tap('input[name="email"]');
    await page.fill('input[name="email"]', 'mobile@example.com');

    // Verify mobile keyboard doesn't interfere with form
    const emailField = page.locator('input[name="email"]');
    await expect(emailField).toBeFocused();
  });

  test('accessibility user journey', async ({ page }) => {
    // Test keyboard-only navigation
    await page.goto('/');

    // Navigate using Tab key
    await page.keyboard.press('Tab'); // Skip to main content link
    await page.keyboard.press('Tab'); // First nav item
    await page.keyboard.press('Tab'); // Work nav item
    await page.keyboard.press('Enter'); // Navigate to work

    await expect(page).toHaveURL('/work');

    // Navigate categories with keyboard
    await page.keyboard.press('Tab'); // First category
    await page.keyboard.press('Enter'); // Select category

    await expect(page).toHaveURL('/work/a');

    // Navigate artworks with keyboard
    await page.keyboard.press('Tab'); // First artwork
    await page.keyboard.press('Enter'); // Open modal

    const modal = page.locator('[data-testid="image-modal"]');
    await expect(modal).toBeVisible();

    // Verify focus management in modal
    const closeButton = modal.locator('[data-testid="modal-close-button"]');
    await expect(closeButton).toBeFocused();

    // Navigate within modal
    await page.keyboard.press('Tab'); // Cart button
    await page.keyboard.press('Tab'); // Should stay within modal

    // Close modal with Escape
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    // Test screen reader announcements
    await page.click(
      '[data-testid="artwork-card"]:first-child [data-testid="select-button"]'
    );

    // Verify ARIA live region updates
    const cartIndicator = page.locator('[data-testid="cart-indicator"]');
    const ariaLabel = await cartIndicator.getAttribute('aria-label');
    expect(ariaLabel).toContain('1 item');
  });

  test('error recovery journey', async ({ page }) => {
    await page.goto('/work/a');

    // Simulate network issues
    await page.route('**/images/**', route => {
      route.fulfill({ status: 500 });
    });

    // Try to view artwork with failed image
    await page.click('[data-testid="artwork-card"]:first-child');
    const modal = page.locator('[data-testid="image-modal"]');
    await expect(modal).toBeVisible();

    // Should show error state but remain functional
    await expect(modal.locator('text=Image unavailable')).toBeVisible();
    await expect(modal.locator('h2')).toBeVisible(); // Title should still show

    // Can still add to cart despite image error
    await page.click('[data-testid="modal-cart-button"]');
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '1'
    );

    await page.keyboard.press('Escape');

    // Navigate to contact
    await page.click('[data-testid="cart-indicator"]');

    // Simulate form submission error
    await page.route('https://api.web3forms.com/submit', route => {
      route.fulfill({ status: 500 });
    });

    // Fill and submit form
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(
      page.locator('text=There was an error sending your message')
    ).toBeVisible();

    // Cart should not be cleared on error
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '1'
    );

    // User can retry
    await page.route('https://api.web3forms.com/submit', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.click('button[type="submit"]');
    await expect(
      page.locator('text=Thank you for your message!')
    ).toBeVisible();
  });

  test('performance during user journey', async ({ page }) => {
    // Track performance metrics throughout journey
    const performanceMetrics: number[] = [];

    // Landing page performance
    let startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    performanceMetrics.push(Date.now() - startTime);

    // Work page performance
    startTime = Date.now();
    await page.click('nav a[href="/work"]');
    await page.waitForLoadState('networkidle');
    performanceMetrics.push(Date.now() - startTime);

    // Category page performance
    startTime = Date.now();
    await page.click('[data-testid="category-card"]:first-child');
    await page.waitForLoadState('networkidle');
    performanceMetrics.push(Date.now() - startTime);

    // Modal performance
    startTime = Date.now();
    await page.click('[data-testid="artwork-card"]:first-child');
    await expect(page.locator('[data-testid="image-modal"]')).toBeVisible();
    performanceMetrics.push(Date.now() - startTime);

    // All interactions should be under 2 seconds
    performanceMetrics.forEach(metric => {
      expect(metric).toBeLessThan(2000);
    });

    // Check memory usage doesn't grow excessively
    const memoryUsage = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Memory usage should be reasonable (under 50MB)
    expect(memoryUsage).toBeLessThan(50 * 1024 * 1024);
  });

  test('cross-browser compatibility journey', async ({ page, browserName }) => {
    await page.goto('/');

    // Test basic functionality across browsers
    await expect(page.locator('h1')).toBeVisible();

    // Navigate to work
    await page.click('nav a[href="/work"]');
    await expect(page.locator('[data-testid="category-grid"]')).toBeVisible();

    // Select category
    await page.click('[data-testid="category-card"]:first-child');
    await expect(
      page.locator('[data-testid="artwork-card"]').first()
    ).toBeVisible();

    // Test modal in different browsers
    await page.click('[data-testid="artwork-card"]:first-child');
    const modal = page.locator('[data-testid="image-modal"]');
    await expect(modal).toBeVisible();

    // Test cart functionality
    await page.click('[data-testid="modal-cart-button"]');
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '1'
    );

    // Browser-specific checks
    if (browserName === 'webkit') {
      // Safari-specific tests
      await expect(modal.locator('img')).toBeVisible();
    } else if (browserName === 'firefox') {
      // Firefox-specific tests
      await expect(modal).toHaveCSS('display', 'flex');
    }

    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });
});
