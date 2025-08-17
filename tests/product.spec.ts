import { test, expect } from '@playwright/test';

test.describe('Product Page', () => {
  test('should load product page successfully', async ({ page }) => {
    await page.goto('/product/san-khoa-gabbe');
    
    // Check if the page loads
    await expect(page).toHaveTitle(/ewYssBook/);
    
    // Check if header is present
    await expect(page.locator('header')).toBeVisible();
    
    // Check if product information is displayed
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('img[alt*="sách"]')).toBeVisible();
  });

  test('should display book details', async ({ page }) => {
    await page.goto('/product/san-khoa-gabbe');
    
    // Check if book title is displayed
    await expect(page.locator('h1')).toContainText(/Sản khoa/);
    
    // Check if author is displayed
    await expect(page.locator('text=bởi')).toBeVisible();
    
    // Check if pricing information is displayed
    await expect(page.locator('text=Tùy chọn giá')).toBeVisible();
  });

  test('should have working breadcrumb navigation', async ({ page }) => {
    await page.goto('/product/san-khoa-gabbe');
    
    // Check if breadcrumb is present
    const breadcrumb = page.locator('nav ol');
    await expect(breadcrumb).toBeVisible();
    
    // Check if home link works
    const homeLink = breadcrumb.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();
    
    // Click on home link
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });

  test('should display preview section', async ({ page }) => {
    await page.goto('/product/san-khoa-gabbe');
    
    // Scroll to preview section
    await page.locator('#book-preview').scrollIntoViewIfNeeded();
    
    // Check if preview section is visible
    await expect(page.locator('#book-preview')).toBeVisible();
    
    // Check if preview content is displayed
    await expect(page.locator('text=Xem trước sách')).toBeVisible();
  });

  test('should have working action buttons', async ({ page }) => {
    await page.goto('/product/san-khoa-gabbe');
    
    // Check if action buttons are present
    const actionButtons = page.locator('button');
    await expect(actionButtons).toHaveCount(3); // Add to cart, preview, and dev purchase
    
    // Check if preview button works
    const previewButton = page.locator('button:has-text("Xem trước")');
    await expect(previewButton).toBeVisible();
    
    // Click preview button should scroll to preview section
    await previewButton.click();
    await expect(page.locator('#book-preview')).toBeVisible();
  });
});

test.describe('Dev Purchase Feature', () => {
  test('should show dev purchase button in development mode', async ({ page }) => {
    await page.goto('/product/san-khoa-gabbe');
    
    // Check if dev purchase button is visible (only in dev mode)
    const devButton = page.locator('button:has-text("Dev Purchase")');
    
    // In development mode, this should be visible
    if (process.env.NODE_ENV === 'development') {
      await expect(devButton).toBeVisible();
    } else {
      await expect(devButton).not.toBeVisible();
    }
  });

  test('should handle dev purchase flow', async ({ page }) => {
    // This test requires authentication
    test.skip(true, 'Requires user authentication');
    
    await page.goto('/product/san-khoa-gabbe');
    
    // Check if dev purchase button is present
    const devButton = page.locator('button:has-text("Dev Purchase")');
    await expect(devButton).toBeVisible();
    
    // Click dev purchase button
    await devButton.click();
    
    // Should show processing state
    await expect(page.locator('text=Processing...')).toBeVisible();
    
    // Should eventually show success message
    await expect(page.locator('text=Dev Purchase Successful!')).toBeVisible();
  });
});
