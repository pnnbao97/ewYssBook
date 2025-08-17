import { test, expect } from '@playwright/test';

test('Simple test button verification', async ({ page }) => {
  // Navigate to the product page
  await page.goto('/product/san-khoa-gabbe');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Check if test button exists
  const testButton = page.locator('button:has-text("Test Purchase")');
  await expect(testButton).toBeVisible();
  
  console.log('Test button found and visible');
  
  // Check if it shows the correct text
  await expect(testButton).toContainText('Test Purchase');
  
  // Check if the button is enabled
  await expect(testButton).toBeEnabled();
  
  console.log('Test button is enabled and clickable');
  
  // Click the button
  await testButton.click();
  
  console.log('Test button clicked');
  
  // Wait a bit to see what happens
  await page.waitForTimeout(2000);
  
  // Check if any processing state appears
  const processingText = page.locator('text=Processing...');
  if (await processingText.isVisible()) {
    console.log('Processing state appeared');
  } else {
    console.log('No processing state appeared');
  }
  
  // Check if any success message appears
  const successText = page.locator('text=Test Purchase Successful!');
  if (await successText.isVisible()) {
    console.log('Success message appeared');
  } else {
    console.log('No success message appeared');
  }
  
  // Check if any error message appears
  const errorText = page.locator('text=error, Error, failed, Failed');
  if (await errorText.isVisible()) {
    console.log('Error message appeared');
  } else {
    console.log('No error message appeared');
  }
  
  // Take a screenshot to see the current state
  await page.screenshot({ path: 'test-button-result.png' });
  
  console.log('Test completed - check test-button-result.png for visual result');
});
