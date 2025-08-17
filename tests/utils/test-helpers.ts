import { Page, expect } from '@playwright/test';

/**
 * Helper function to wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Helper function to check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Check if user button or profile element is visible
    const userButton = page.locator('[data-testid="user-button"], .user-button, button:has-text("User")');
    return await userButton.isVisible();
  } catch {
    return false;
  }
}

/**
 * Helper function to login user (if needed for tests)
 */
export async function loginUser(page: Page, email?: string, password?: string) {
  // This would need to be implemented based on your authentication flow
  // For now, we'll just check if user is already logged in
  if (await isAuthenticated(page)) {
    console.log('User is already authenticated');
    return;
  }
  
  // Navigate to login page if needed
  await page.goto('/sign-in');
  
  // Fill in login form if provided
  if (email && password) {
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL(/\/|dashboard/);
  }
}

/**
 * Helper function to create test data
 */
export async function createTestBook(page: Page) {
  // This would create test book data for testing
  // Implementation depends on your admin interface
  console.log('Creating test book data...');
}

/**
 * Helper function to clean up test data
 */
export async function cleanupTestData(page: Page) {
  // This would clean up test data after tests
  console.log('Cleaning up test data...');
}

/**
 * Helper function to take screenshot on test failure
 */
export async function takeScreenshotOnFailure(page: Page, testName: string) {
  try {
    await page.screenshot({ 
      path: `test-results/screenshots/${testName}-failure.png`,
      fullPage: true 
    });
  } catch (error) {
    console.error('Failed to take screenshot:', error);
  }
}

/**
 * Helper function to check if element exists and is visible
 */
export async function expectElementVisible(page: Page, selector: string, description?: string) {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  return element;
}

/**
 * Helper function to check if element exists but is not visible
 */
export async function expectElementNotVisible(page: Page, selector: string, description?: string) {
  const element = page.locator(selector);
  await expect(element).not.toBeVisible();
}

/**
 * Helper function to wait for API response
 */
export async function waitForAPIResponse(page: Page, urlPattern: RegExp, timeout = 10000) {
  return page.waitForResponse(
    response => response.url().match(urlPattern) !== null,
    { timeout }
  );
}

/**
 * Helper function to mock API responses for testing
 */
export async function mockAPIResponse(page: Page, url: string, response: any) {
  await page.route(url, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });
}
