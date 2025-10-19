import { test, expect } from '@playwright/test';

test.describe('Image Modal Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/work/a');
    // Wait for artworks to load
    await expect(
      page.locator('[data-testid="artwork-card"]').first()
    ).toBeVisible();
  });

  test('open and close modal with mouse interactions', async ({ page }) => {
    // Click on artwork to open modal
    await page.click('[data-testid="artwork-card"]:first-child');

    // Verify modal is open
    const modal = page.locator('[data-testid="image-modal"]');
    await expect(modal).toBeVisible();

    // Verify modal content
    await expect(modal.locator('img')).toBeVisible();
    await expect(modal.locator('h2')).toBeVisible(); // Artwork title
    await expect(modal.locator('text=A1')).toBeVisible(); // Artwork ID

    // Close modal with X button
    await page.click('[data-testid="modal-close-button"]');
    await expect(modal).not.toBeVisible();
  });

  test('close modal by clicking backdrop', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="artwork-card"]:first-child');
    const modal = page.locator('[data-testid="image-modal"]');
    await expect(modal).toBeVisible();

    // Click on backdrop (outside modal content)
    await page.click('[data-testid="modal-backdrop"]');
    await expect(modal).not.toBeVisible();
  });

  test('close modal with Escape key', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="artwork-card"]:first-child');
    const modal = page.locator('[data-testid="image-modal"]');
    await expect(modal).toBeVisible();

    // Press Escape key
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('modal displays complete artwork information', async ({ page }) => {
    // Open modal for first artwork
    await page.click('[data-testid="artwork-card"]:first-child');
    const modal = page.locator('[data-testid="image-modal"]');

    // Verify all artwork details are displayed
    await expect(modal.locator('h2')).toContainText('Abstract Composition 1');
    await expect(modal.locator('text=A1')).toBeVisible();
    await expect(modal.locator('text=2023')).toBeVisible(); // Year
    await expect(modal.locator('text=Oil on canvas')).toBeVisible(); // Medium
    await expect(modal.locator('text=24x36 inches')).toBeVisible(); // Dimensions
    await expect(modal.locator('text=Category A')).toBeVisible(); // Category

    // Verify description
    await expect(modal.locator('text=A vibrant abstract piece')).toBeVisible();
  });

  test('modal cart integration', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="artwork-card"]:first-child');
    const modal = page.locator('[data-testid="image-modal"]');

    // Verify cart button in modal
    const modalCartButton = modal.locator('[data-testid="modal-cart-button"]');
    await expect(modalCartButton).toBeVisible();
    await expect(modalCartButton).toContainText('Add to Selection');

    // Add to cart from modal
    await modalCartButton.click();

    // Verify cart count updated
    await expect(page.locator('[data-testid="cart-indicator"]')).toContainText(
      '1'
    );

    // Verify button text changed
    await expect(modalCartButton).toContainText('Remove from Selection');

    // Close modal and verify artwork shows as selected
    await page.keyboard.press('Escape');
    const artworkCard = page.locator('[data-testid="artwork-card"]').first();
    await expect(artworkCard).toHaveClass(/ring-2/);
  });

  test('modal navigation between artworks', async ({ page }) => {
    // Open modal for first artwork
    await page.click('[data-testid="artwork-card"]:first-child');
    const modal = page.locator('[data-testid="image-modal"]');

    // Verify first artwork is displayed
    await expect(modal.locator('text=A1')).toBeVisible();

    // Check if navigation arrows exist
    const nextButton = modal.locator('[data-testid="modal-next-button"]');
    const prevButton = modal.locator('[data-testid="modal-prev-button"]');

    if (await nextButton.isVisible()) {
      // Navigate to next artwork
      await nextButton.click();
      await expect(modal.locator('text=A2')).toBeVisible();

      // Navigate back
      await prevButton.click();
      await expect(modal.locator('text=A1')).toBeVisible();
    }
  });

  test('modal keyboard navigation', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="artwork-card"]:first-child');
    const modal = page.locator('[data-testid="image-modal"]');

    // Test Tab navigation within modal
    await page.keyboard.press('Tab');

    // Should focus on close button or cart button
    const focusedElement = page.locator(':focus');
    const tagName = await focusedElement.evaluate(el => el.tagName);
    expect(tagName).toBe('BUTTON');

    // Test arrow key navigation if supported
    await page.keyboard.press('ArrowRight');
    // Should navigate to next artwork or do nothing gracefully

    await page.keyboard.press('ArrowLeft');
    // Should navigate to previous artwork or do nothing gracefully
  });

  test('modal responsive behavior', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.click('[data-testid="artwork-card"]:first-child');

    let modal = page.locator('[data-testid="image-modal"]');
    await expect(modal).toBeVisible();

    // Verify desktop layout (image left, content right)
    const modalContent = modal.locator('[data-testid="modal-content"]');
    const boundingBox = await modalContent.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(800);

    // Close modal
    await page.keyboard.press('Escape');

    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.click('[data-testid="artwork-card"]:first-child');

    modal = page.locator('[data-testid="image-modal"]');
    await expect(modal).toBeVisible();

    // Verify mobile layout (stacked vertically)
    const mobileContent = modal.locator('[data-testid="modal-content"]');
    const mobileBoundingBox = await mobileContent.boundingBox();
    expect(mobileBoundingBox?.width).toBeLessThan(400);
  });

  test('modal image loading states', async ({ page }) => {
    // Intercept image requests to test loading states
    await page.route('**/images/**', route => {
      // Delay image loading
      setTimeout(() => route.continue(), 1000);
    });

    await page.click('[data-testid="artwork-card"]:first-child');
    const modal = page.locator('[data-testid="image-modal"]');

    // Should show loading state initially
    await expect(modal.locator('[data-testid="image-loading"]')).toBeVisible();

    // Wait for image to load
    await expect(modal.locator('img')).toBeVisible({ timeout: 5000 });
    await expect(
      modal.locator('[data-testid="image-loading"]')
    ).not.toBeVisible();
  });

  test('modal error handling', async ({ page }) => {
    // Intercept image requests to simulate errors
    await page.route('**/images/**', route => {
      route.fulfill({ status: 404 });
    });

    await page.click('[data-testid="artwork-card"]:first-child');
    const modal = page.locator('[data-testid="image-modal"]');

    // Should show error state
    await expect(modal.locator('text=Image unavailable')).toBeVisible();

    // Modal should still be functional
    await expect(modal.locator('h2')).toBeVisible(); // Title should still show
    await expect(
      modal.locator('[data-testid="modal-close-button"]')
    ).toBeVisible();
  });

  test('modal accessibility features', async ({ page }) => {
    await page.click('[data-testid="artwork-card"]:first-child');
    const modal = page.locator('[data-testid="image-modal"]');

    // Check ARIA attributes
    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(modal).toHaveAttribute('aria-modal', 'true');

    // Check aria-labelledby points to title
    const ariaLabelledBy = await modal.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      await expect(page.locator(`#${ariaLabelledBy}`)).toBeVisible();
    }

    // Check focus management
    const closeButton = modal.locator('[data-testid="modal-close-button"]');
    await expect(closeButton).toBeFocused();

    // Check that focus is trapped in modal
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    const isWithinModal = await focusedElement.evaluate(
      (el, modalEl) => modalEl.contains(el),
      await modal.elementHandle()
    );
    expect(isWithinModal).toBe(true);
  });

  test('modal prevents body scroll', async ({ page }) => {
    // Check initial body overflow
    const initialOverflow = await page.evaluate(
      () => document.body.style.overflow
    );

    // Open modal
    await page.click('[data-testid="artwork-card"]:first-child');

    // Check that body scroll is prevented
    const modalOverflow = await page.evaluate(
      () => document.body.style.overflow
    );
    expect(modalOverflow).toBe('hidden');

    // Close modal
    await page.keyboard.press('Escape');

    // Check that body scroll is restored
    const finalOverflow = await page.evaluate(
      () => document.body.style.overflow
    );
    expect(finalOverflow).toBe(initialOverflow);
  });

  test('modal performance with large images', async ({ page }) => {
    // Measure modal open time
    const startTime = Date.now();

    await page.click('[data-testid="artwork-card"]:first-child');
    const modal = page.locator('[data-testid="image-modal"]');
    await expect(modal).toBeVisible();

    const openTime = Date.now() - startTime;

    // Modal should open quickly (under 500ms)
    expect(openTime).toBeLessThan(500);

    // Verify image loads efficiently
    const image = modal.locator('img');
    await expect(image).toBeVisible();

    const imageLoadTime = Date.now() - startTime;
    // Total time including image load should be reasonable
    expect(imageLoadTime).toBeLessThan(2000);
  });

  test('multiple modal interactions', async ({ page }) => {
    // Open first modal
    await page.click('[data-testid="artwork-card"]:nth-child(1)');
    let modal = page.locator('[data-testid="image-modal"]');
    await expect(modal.locator('text=A1')).toBeVisible();

    // Close and open different modal
    await page.keyboard.press('Escape');
    await page.click('[data-testid="artwork-card"]:nth-child(2)');

    modal = page.locator('[data-testid="image-modal"]');
    await expect(modal.locator('text=A2')).toBeVisible();

    // Verify previous modal content is not visible
    await expect(modal.locator('text=A1')).not.toBeVisible();
  });
});
