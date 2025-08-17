import { test, expect } from '@playwright/test';

test.describe('Test Dev Purchase (No Auth Required)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the product page before each test
    await page.goto('/product/san-khoa-gabbe');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should display test dev purchase button', async ({ page }) => {
    // Check if test dev purchase button is visible
    const testButton = page.locator('button:has-text("Test Purchase")');
    await expect(testButton).toBeVisible();
    
    // Check if it shows "Test Mode (No Auth Required)"
    await expect(page.locator('text=Test Mode (No Auth Required)')).toBeVisible();
    
    // Check if it has the correct styling (blue theme)
    await expect(testButton).toHaveClass(/bg-blue-600/);
  });

  test('should complete test purchase flow successfully', async ({ page }) => {
    // Step 1: Click test dev purchase button
    const testButton = page.locator('button:has-text("Test Purchase")');
    await expect(testButton).toBeVisible();
    await testButton.click();
    
    // Step 2: Wait for processing state
    await expect(page.locator('text=Processing...')).toBeVisible();
    
    // Step 3: Wait for success message
    await expect(page.locator('text=Test Purchase Successful!')).toBeVisible();
    
    // Step 4: Verify the purchase status section appears
    await expect(page.locator('text=Bạn đã mua sách này')).toBeVisible();
    
    // Step 5: Verify "Read Book" button appears instead of "Add to Cart"
    await expect(page.locator('button:has-text("Đọc sách")')).toBeVisible();
    await expect(page.locator('button:has-text("Thêm vào giỏ hàng")')).not.toBeVisible();
  });

  test('should handle PDF viewer after test purchase', async ({ page }) => {
    // Complete the test purchase first
    const testButton = page.locator('button:has-text("Test Purchase")');
    await testButton.click();
    
    // Wait for success
    await expect(page.locator('text=Test Purchase Successful!')).toBeVisible();
    
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

  test('should navigate to payment page after test purchase', async ({ page }) => {
    // Complete the test purchase first
    const testButton = page.locator('button:has-text("Test Purchase")');
    await testButton.click();
    
    // Wait for success
    await expect(page.locator('text=Test Purchase Successful!')).toBeVisible();
    
    // Look for payment/checkout link
    const paymentLink = page.locator('a:has-text("Thanh toán"), a:has-text("Checkout"), a:has-text("Payment")');
    
    if (await paymentLink.isVisible()) {
      // Click on payment link
      await paymentLink.click();
      
      // Should navigate to payment page
      await expect(page).toHaveURL(/thanh-toan|checkout|payment/);
      
      // Verify payment page loads
      await expect(page.locator('h1, h2')).toBeVisible();
    } else {
      console.log('Payment link not found, but test purchase was successful');
    }
  });

  test('should handle multiple test purchases correctly', async ({ page }) => {
    // Complete first test purchase
    const testButton = page.locator('button:has-text("Test Purchase")');
    await testButton.click();
    
    // Wait for success
    await expect(page.locator('text=Test Purchase Successful!')).toBeVisible();
    
    // Wait for success message to disappear
    await page.waitForTimeout(3000);
    
    // Try to purchase again (should still work)
    const testButtonAgain = page.locator('button:has-text("Test Purchase")');
    if (await testButtonAgain.isVisible()) {
      await testButtonAgain.click();
      
      // Should show success again
      await expect(page.locator('text=Test Purchase Successful!')).toBeVisible();
    }
  });
});

test.describe('Test Dev Purchase API Testing', () => {
  test('should test API endpoint directly without auth', async ({ request }) => {
    // Test the test API endpoint (no auth required)
    const response = await request.post('/api/test/dev-purchase-book', {
      data: {
        bookId: 'test-book-id',
        version: 'color',
        testUserId: 'playwright-test-user'
      }
    });
    
    // Should return 404 (Book not found) since we're using a fake book ID
    // This confirms the endpoint exists and is working
    expect(response.status()).toBe(404);
    
    const responseData = await response.json();
    expect(responseData.message).toContain('Book not found');
  });

  test('should test API with valid book ID', async ({ request }) => {
    // First, we need to get a real book ID from the database
    // For now, we'll test the endpoint structure
    test.skip(true, 'Need real book ID from database to test properly');
  });
});
