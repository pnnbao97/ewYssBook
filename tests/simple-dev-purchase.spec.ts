import { test, expect } from '@playwright/test';

test('Complete dev purchase flow', async ({ page }) => {
  // Handle any dialogs that might appear
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });

  // Navigate to product page
  await page.goto('/product/san-khoa-gabbe');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Step 1: Click dev purchase button
  const devButton = page.getByRole('button', { name: 'Dev Purchase (Color Version)' });
  await expect(devButton).toBeVisible();
  await devButton.click();
  
  // Step 2: Wait for processing and success
  await expect(page.locator('text=Processing...')).toBeVisible();
  await expect(page.locator('text=Dev Purchase Successful!')).toBeVisible();
  
  // Step 3: Verify purchase status
  await expect(page.locator('text=Bạn đã mua sách này')).toBeVisible();
  
  // Step 4: Look for cart or payment options
  // Try to find cart icon or payment link
  const cartIcon = page.locator('[data-testid="cart-icon"], .cart-icon, button:has-text("Cart"), button:has-text("Giỏ hàng")');
  
  if (await cartIcon.isVisible()) {
    await cartIcon.click();
    
    // Look for quantity button (like "1")
    const quantityButton = page.getByRole('button', { name: '1' });
    if (await quantityButton.isVisible()) {
      await quantityButton.click();
    }
  }
  
  // Step 5: Look for payment/checkout link
  const paymentLink = page.getByRole('link', { name: 'Thanh toán' });
  
  if (await paymentLink.isVisible()) {
    await paymentLink.click();
    
    // Should navigate to payment page
    await expect(page).toHaveURL(/thanh-toan|checkout|payment/);
    
    // Verify payment page loads
    await expect(page.locator('h1, h2')).toBeVisible();
  } else {
    console.log('Payment link not found, skipping payment page test');
  }
});
