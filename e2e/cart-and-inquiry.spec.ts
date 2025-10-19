import { test, expect } from '@playwright/test';

test.describe('Cart and Inquiry Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/work/a');
  });

  test('complete cart workflow - select artworks and submit inquiry', async ({
    page,
  }) => {
    // Verify cart indicator starts at 0
    const cartIndicator = page.locator('[data-testid="cart-indicator"]');
    await expect(cartIndicator).toContainText('0');

    // Select first artwork
    const firstArtwork = page.locator('[data-testid="artwork-card"]').first();
    const firstSelectButton = firstArtwork.locator(
      '[data-testid="select-button"]'
    );
    await firstSelectButton.click();

    // Verify cart count updates
    await expect(cartIndicator).toContainText('1');

    // Verify artwork shows as selected
    await expect(firstArtwork).toHaveClass(/ring-2/);
    await expect(firstSelectButton).toContainText('Remove from Selection');

    // Select second artwork
    const secondArtwork = page.locator('[data-testid="artwork-card"]').nth(1);
    await secondArtwork.locator('[data-testid="select-button"]').click();
    await expect(cartIndicator).toContainText('2');

    // Navigate to contact page via cart
    await page.click('[data-testid="cart-indicator"]');
    await expect(page).toHaveURL('/contact');

    // Verify pre-filled message
    const messageField = page.locator('textarea[name="message"]');
    const messageValue = await messageField.inputValue();
    expect(messageValue).toContain(
      'I am interested in knowing the prices of the following prints:'
    );
    expect(messageValue).toMatch(/A\d+/); // Should contain artwork IDs

    // Fill out contact form
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="email"]', 'john@example.com');

    // Submit form (mock the submission)
    await page.route('https://api.web3forms.com/submit', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.click('button[type="submit"]');

    // Verify success message
    await expect(
      page.locator('text=Thank you for your message!')
    ).toBeVisible();

    // Verify cart is cleared after successful submission
    await expect(cartIndicator).toContainText('0');
  });

  test('cart persistence across page navigation', async ({ page }) => {
    // Select artwork
    await page.click(
      '[data-testid="artwork-card"]:first-child [data-testid="select-button"]'
    );
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '1'
    );

    // Navigate to different pages
    await page.click('nav a[href="/about"]');
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '1'
    );

    await page.click('nav a[href="/"]');
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '1'
    );

    // Return to work page
    await page.click('nav a[href="/work"]');
    await page.click('[data-testid="category-card"]:has-text("Category A")');

    // Verify selection is still active
    const selectedArtwork = page
      .locator('[data-testid="artwork-card"]')
      .first();
    await expect(selectedArtwork).toHaveClass(/ring-2/);
  });

  test('remove items from cart', async ({ page }) => {
    // Add multiple items
    await page.click(
      '[data-testid="artwork-card"]:nth-child(1) [data-testid="select-button"]'
    );
    await page.click(
      '[data-testid="artwork-card"]:nth-child(2) [data-testid="select-button"]'
    );
    await page.click(
      '[data-testid="artwork-card"]:nth-child(3) [data-testid="select-button"]'
    );

    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '3'
    );

    // Remove one item
    await page.click(
      '[data-testid="artwork-card"]:nth-child(2) [data-testid="select-button"]'
    );
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '2'
    );

    // Verify button text changed back
    const removedArtwork = page.locator('[data-testid="artwork-card"]').nth(1);
    await expect(
      removedArtwork.locator('[data-testid="select-button"]')
    ).toContainText('Add to Selection');
    await expect(removedArtwork).not.toHaveClass(/ring-2/);
  });

  test('cart limit and validation', async ({ page }) => {
    // Try to add many items (test any limits)
    const artworkCards = page.locator('[data-testid="artwork-card"]');
    const count = await artworkCards.count();

    // Add all visible artworks
    for (let i = 0; i < Math.min(count, 10); i++) {
      await artworkCards
        .nth(i)
        .locator('[data-testid="select-button"]')
        .click();
    }

    // Verify cart count
    const finalCount = Math.min(count, 10);
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      finalCount.toString()
    );
  });

  test('contact form validation with cart items', async ({ page }) => {
    // Add item to cart
    await page.click(
      '[data-testid="artwork-card"]:first-child [data-testid="select-button"]'
    );

    // Go to contact page
    await page.click('[data-testid="cart-indicator"]');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Verify validation errors
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();

    // Fill invalid email
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');

    await expect(
      page.locator('text=Please enter a valid email address')
    ).toBeVisible();

    // Fix email and submit
    await page.fill('input[name="email"]', 'john@example.com');

    // Mock successful submission
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

  test('cart accessibility', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab'); // Navigate to first artwork
    await page.keyboard.press('Tab'); // Navigate to select button
    await page.keyboard.press('Enter'); // Select artwork

    // Verify selection worked
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '1'
    );

    // Test screen reader labels
    const selectButton = page.locator('[data-testid="select-button"]').first();
    const ariaLabel = await selectButton.getAttribute('aria-label');
    expect(ariaLabel).toMatch(/Add A\d+ to cart|Remove A\d+ from cart/);

    // Test cart indicator accessibility
    const cartIndicator = page.locator('[data-testid="cart-indicator"]');
    const cartAriaLabel = await cartIndicator.getAttribute('aria-label');
    expect(cartAriaLabel).toContain('1 item');
  });

  test('cart on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Select artwork on mobile
    await page.click(
      '[data-testid="artwork-card"]:first-child [data-testid="select-button"]'
    );

    // Verify mobile cart indicator
    const cartIndicator = page.locator('[data-testid="cart-indicator"]');
    await expect(cartIndicator).toBeVisible();
    await expect(cartIndicator).toContainText('1');

    // Test touch interactions
    await page.tap(
      '[data-testid="artwork-card"]:nth-child(2) [data-testid="select-button"]'
    );
    await expect(cartIndicator).toContainText('2');

    // Navigate to contact via mobile cart
    await page.tap('[data-testid="cart-indicator"]');
    await expect(page).toHaveURL('/contact');

    // Verify mobile form layout
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Check mobile-specific styling
    const firstNameField = page.locator('input[name="firstName"]');
    const boundingBox = await firstNameField.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(300); // Should be full width on mobile
  });

  test('error handling in cart workflow', async ({ page }) => {
    // Add item to cart
    await page.click(
      '[data-testid="artwork-card"]:first-child [data-testid="select-button"]'
    );
    await page.click('[data-testid="cart-indicator"]');

    // Fill form
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="email"]', 'john@example.com');

    // Mock network error
    await page.route('https://api.web3forms.com/submit', route => {
      route.abort('failed');
    });

    await page.click('button[type="submit"]');

    // Verify error message
    await expect(
      page.locator('text=There was an error sending your message')
    ).toBeVisible();

    // Verify cart is not cleared on error
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '1'
    );
  });

  test('cart state management edge cases', async ({ page }) => {
    // Test rapid clicking
    const selectButton = page.locator(
      '[data-testid="artwork-card"]:first-child [data-testid="select-button"]'
    );

    // Click multiple times rapidly
    await selectButton.click();
    await selectButton.click();
    await selectButton.click();

    // Should only toggle once per click
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '0'
    );

    // Test with page refresh
    await selectButton.click();
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '1'
    );

    await page.reload();

    // Cart should persist after reload (if using localStorage)
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '1'
    );
  });
});
