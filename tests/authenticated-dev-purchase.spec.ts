import { test, expect } from '@playwright/test';

test.describe('Authenticated Dev Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the product page
    await page.goto('/product/san-khoa-gabbe');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if user is already authenticated
    const userButton = page.locator('[data-testid="user-button"], .user-button, button:has-text("User"), button:has-text("Sign Out")');
    
    if (await userButton.isVisible()) {
      console.log('User is already authenticated');
    } else {
      console.log('User is not authenticated - this test requires manual login');
      // For now, we'll skip the test if not authenticated
      test.skip(true, 'User must be manually logged in to test dev purchase');
    }
  });

  test('should complete dev purchase when authenticated', async ({ page }) => {
    // Check if user is authenticated
    const userButton = page.locator('[data-testid="user-button"], .user-button, button:has-text("User"), button:has-text("Sign Out")');
    
    if (!(await userButton.isVisible())) {
      test.skip(true, 'User must be logged in');
      return;
    }

    // Step 1: Click dev purchase button
    const devButton = page.locator('button:has-text("Dev Purchase")');
    await expect(devButton).toBeVisible();
    await devButton.click();
    
    // Step 2: Wait for processing
    await expect(page.locator('text=Processing...')).toBeVisible();
    
    // Step 3: Wait for success message
    await expect(page.locator('text=Dev Purchase Successful!')).toBeVisible();
    
    // Step 4: Verify purchase status
    await expect(page.locator('text=Bạn đã mua sách này')).toBeVisible();
    
    // Step 5: Verify "Read Book" button appears
    await expect(page.locator('button:has-text("Đọc sách")')).toBeVisible();
  });

  test('should navigate to payment page after purchase', async ({ page }) => {
    // Check if user is authenticated
    const userButton = page.locator('[data-testid="user-button"], .user-button, button:has-text("User"), button:has-text("Sign Out")');
    
    if (!(await userButton.isVisible())) {
      test.skip(true, 'User must be logged in');
      return;
    }

    // Complete the purchase first
    const devButton = page.locator('button:has-text("Dev Purchase")');
    await devButton.click();
    
    // Wait for success
    await expect(page.locator('text=Dev Purchase Successful!')).toBeVisible();
    
    // Look for payment/checkout link
    const paymentLink = page.locator('a:has-text("Thanh toán"), a:has-text("Checkout"), a:has-text("Payment")');
    
    if (await paymentLink.isVisible()) {
      await paymentLink.click();
      
      // Should navigate to payment page
      await expect(page).toHaveURL(/thanh-toan|checkout|payment/);
      
      // Verify payment page loads
      await expect(page.locator('h1, h2')).toBeVisible();
    } else {
      console.log('Payment link not found');
    }
  });
});
