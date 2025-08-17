import { test, expect } from '@playwright/test';

test.describe('Dev Purchase Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a product page before each test
    await page.goto('/product/san-khoa-gabbe');
  });

  test('should display dev purchase button in development mode', async ({ page }) => {
    // Check if dev purchase button is visible
    const devButton = page.locator('button:has-text("Dev Purchase")');
    
    // In development mode, this should be visible
    if (process.env.NODE_ENV === 'development') {
      await expect(devButton).toBeVisible();
      
      // Check if it has the correct styling
      await expect(devButton).toHaveClass(/bg-yellow-600/);
      
      // Check if the button text is correct
      await expect(devButton).toContainText('Dev Purchase (Color Version)');
    } else {
      await expect(devButton).not.toBeVisible();
    }
  });

  test('should show developer mode indicator', async ({ page }) => {
    // Check if the developer mode section is visible
    const devSection = page.locator('text=Developer Mode');
    await expect(devSection).toBeVisible();
    
    // Check if the explanation text is present
    const explanationText = page.locator('text=This button only appears in development mode for testing purposes.');
    await expect(explanationText).toBeVisible();
  });

  test('should display correct pricing information', async ({ page }) => {
    // Check if the pricing section is visible
    const pricingSection = page.locator('text=Tùy chọn giá');
    await expect(pricingSection).toBeVisible();
    
    // Check if color version pricing is displayed
    const colorPrice = page.locator('text=Bản màu');
    await expect(colorPrice).toBeVisible();
    
    // Check if black and white version pricing is displayed
    const bwPrice = page.locator('text=Bản đen trắng');
    await expect(bwPrice).toBeVisible();
  });

  test('should have working preview functionality', async ({ page }) => {
    // Check if preview button is present
    const previewButton = page.locator('button:has-text("Xem trước")');
    await expect(previewButton).toBeVisible();
    
    // Click preview button
    await previewButton.click();
    
    // Should scroll to preview section
    await page.locator('#book-preview').scrollIntoViewIfNeeded();
    await expect(page.locator('#book-preview')).toBeVisible();
  });

  test('should display book information correctly', async ({ page }) => {
    // Check if book title is displayed
    const title = page.locator('h1');
    await expect(title).toBeVisible();
    await expect(title).toContainText(/Sản khoa/);
    
    // Check if author is displayed
    const author = page.locator('text=bởi');
    await expect(author).toBeVisible();
    
    // Check if cover image is displayed
    const coverImage = page.locator('img[alt*="sách"]');
    await expect(coverImage).toBeVisible();
  });

  test('should have working breadcrumb navigation', async ({ page }) => {
    // Check if breadcrumb is present
    const breadcrumb = page.locator('nav ol');
    await expect(breadcrumb).toBeVisible();
    
    // Check if home link is present
    const homeLink = breadcrumb.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();
    
    // Check if books link is present
    const booksLink = breadcrumb.locator('a[href="/sach"]');
    await expect(booksLink).toBeVisible();
  });

  test('should display purchase status section', async ({ page }) => {
    // Check if purchase status section is present (initially hidden for non-purchased books)
    const purchaseStatus = page.locator('text=Bạn đã mua sách này');
    
    // This should not be visible initially
    await expect(purchaseStatus).not.toBeVisible();
  });

  test('should have proper action button layout', async ({ page }) => {
    // Check if action buttons container is present
    const actionButtons = page.locator('div.flex.space-x-4');
    await expect(actionButtons).toBeVisible();
    
    // Check if at least the preview button is present
    const previewButton = page.locator('button:has-text("Xem trước")');
    await expect(previewButton).toBeVisible();
  });
});

test.describe('Dev Purchase API Integration', () => {
  test('should have dev purchase API endpoint accessible', async ({ request }) => {
    // Test if the dev purchase API endpoint exists
    const response = await request.post('/api/dev/purchase-book', {
      data: {
        bookId: 'test-book-id',
        version: 'color'
      }
    });
    
    // Should return 401 (Unauthorized) since we're not authenticated
    // This confirms the endpoint exists and is working
    expect(response.status()).toBe(401);
  });

  test('should reject requests in non-development mode', async ({ request }) => {
    // This test would need to be run in production mode to verify
    // For now, we'll just document the expected behavior
    test.skip(true, 'This test requires production environment to verify endpoint blocking');
  });
});
