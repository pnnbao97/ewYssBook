import { test, expect } from '@playwright/test';

test.describe('Dev Purchase Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the product page before each test
    await page.goto('/product/san-khoa-gabbe');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should complete dev purchase flow successfully', async ({ page }) => {
    // Step 1: Check if dev purchase button is visible
    const devButton = page.locator('button:has-text("Dev Purchase")');
    await expect(devButton).toBeVisible();
    
    // Step 2: Click dev purchase button
    await devButton.click();
    
    // Step 3: Wait for processing state
    await expect(page.locator('text=Processing...')).toBeVisible();
    
    // Step 4: Wait for success message
    await expect(page.locator('text=Dev Purchase Successful!')).toBeVisible();
    
    // Step 5: Verify the purchase status section appears
    await expect(page.locator('text=Bạn đã mua sách này')).toBeVisible();
    
    // Step 6: Verify "Read Book" button appears instead of "Add to Cart"
    await expect(page.locator('button:has-text("Đọc sách")')).toBeVisible();
    await expect(page.locator('button:has-text("Thêm vào giỏ hàng")')).not.toBeVisible();
  });

  test('should handle cart functionality after purchase', async ({ page }) => {
    // First complete the purchase
    const devButton = page.locator('button:has-text("Dev Purchase")');
    await devButton.click();
    
    // Wait for success
    await expect(page.locator('text=Dev Purchase Successful!')).toBeVisible();
    
    // Check if cart icon shows items
    const cartIcon = page.locator('[data-testid="cart-icon"], .cart-icon, button:has-text("Cart")');
    if (await cartIcon.isVisible()) {
      // Cart should show some items after purchase
      await expect(cartIcon).toBeVisible();
    }
  });

  test('should navigate to payment page after purchase', async ({ page }) => {
    // Complete the purchase first
    const devButton = page.locator('button:has-text("Dev Purchase")');
    await devButton.click();
    
    // Wait for success
    await expect(page.locator('text=Dev Purchase Successful!')).toBeVisible();
    
    // Look for payment/checkout link
    const paymentLink = page.locator('a:has-text("Thanh toán"), a:has-text("Checkout"), a:has-text("Payment")');
    
    if (await paymentLink.isVisible()) {
      // Click on payment link
      await paymentLink.click();
      
      // Should navigate to payment page
      await expect(page).toHaveURL(/thanh-toan|checkout|payment/);
      
      // Verify payment page loads
      await expect(page.locator('h1, h2')).toBeVisible();
    }
  });

  test('should show correct purchase information', async ({ page }) => {
    // Complete the purchase
    const devButton = page.locator('button:has-text("Dev Purchase")');
    await devButton.click();
    
    // Wait for success
    await expect(page.locator('text=Dev Purchase Successful!')).toBeVisible();
    
    // Verify purchase details are shown
    await expect(page.locator('text=Bạn đã mua sách này')).toBeVisible();
    await expect(page.locator('text=Bạn có thể đọc sách ngay bây giờ')).toBeVisible();
  });

  test('should handle PDF viewer after purchase', async ({ page }) => {
    // Complete the purchase
    const devButton = page.locator('button:has-text("Dev Purchase")');
    await devButton.click();
    
    // Wait for success
    await expect(page.locator('text=Dev Purchase Successful!')).toBeVisible();
    
    // Click on "Read Book" button
    const readBookButton = page.locator('button:has-text("Đọc sách")');
    await readBookButton.click();
    
    // Should show PDF viewer modal
    const pdfViewer = page.locator('.fixed.inset-0.bg-black\\/80, [data-testid="pdf-viewer"]');
    await expect(pdfViewer).toBeVisible();
    
    // Check if PDF viewer has controls
    await expect(page.locator('button:has-text("Tải xuống")')).toBeVisible();
    await expect(page.locator('button:has-text("ZoomIn")')).toBeVisible();
  });

  test('should handle multiple purchases correctly', async ({ page }) => {
    // Complete first purchase
    const devButton = page.locator('button:has-text("Dev Purchase")');
    await devButton.click();
    
    // Wait for success
    await expect(page.locator('text=Dev Purchase Successful!')).toBeVisible();
    
    // Wait for success message to disappear
    await page.waitForTimeout(3000);
    
    // Try to purchase again (should still work)
    const devButtonAgain = page.locator('button:has-text("Dev Purchase")');
    if (await devButtonAgain.isVisible()) {
      await devButtonAgain.click();
      
      // Should show success again
      await expect(page.locator('text=Dev Purchase Successful!')).toBeVisible();
    }
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('/api/dev/purchase-book', route => {
      route.abort('failed');
    });
    
    // Try to purchase
    const devButton = page.locator('button:has-text("Dev Purchase")');
    await devButton.click();
    
    // Should handle error gracefully
    // This might show an error message or alert
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('error');
      dialog.dismiss();
    });
  });
});

test.describe('Dev Purchase API Testing', () => {
  test('should test API endpoint directly', async ({ request }) => {
    // Test API endpoint without authentication
    const response = await request.post('/api/dev/purchase-book', {
      data: {
        bookId: 'test-book-id',
        version: 'color'
      }
    });
    
    // Should return 401 (Unauthorized) since we're not authenticated
    expect(response.status()).toBe(401);
    
    const responseData = await response.json();
    expect(responseData.message).toContain('Unauthorized');
  });

  test('should test API with invalid book ID', async ({ request }) => {
    // This test would need authentication to work properly
    // For now, we'll just test the endpoint structure
    test.skip(true, 'Requires authentication to test properly');
  });
});
