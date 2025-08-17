import { Page } from '@playwright/test';

/**
 * Helper to check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Look for various authentication indicators
    const authIndicators = [
      '[data-testid="user-button"]',
      '.user-button',
      'button:has-text("User")',
      'button:has-text("Sign Out")',
      'button:has-text("Đăng xuất")',
      '[data-testid="user-menu"]',
      '.user-menu'
    ];
    
    for (const selector of authIndicators) {
      if (await page.locator(selector).isVisible()) {
        return true;
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Helper to wait for authentication
 */
export async function waitForAuthentication(page: Page, timeout = 30000): Promise<boolean> {
  try {
    await page.waitForFunction(() => {
      // Check if any auth indicators are visible
      const indicators = document.querySelectorAll('[data-testid="user-button"], .user-button, button:has-text("User"), button:has-text("Sign Out")');
      return indicators.length > 0;
    }, { timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to handle authentication dialog
 */
export async function handleAuthDialog(page: Page): Promise<void> {
  // Listen for any dialogs that might appear
  page.on('dialog', dialog => {
    console.log(`Dialog appeared: ${dialog.message()}`);
    
    // If it's an auth-related dialog, dismiss it
    if (dialog.message().toLowerCase().includes('auth') || 
        dialog.message().toLowerCase().includes('login') ||
        dialog.message().toLowerCase().includes('sign')) {
      dialog.dismiss();
    } else {
      // For other dialogs, accept them
      dialog.accept();
    }
  });
}

/**
 * Helper to navigate to login page
 */
export async function navigateToLogin(page: Page): Promise<void> {
  // Look for login/signin links
  const loginLinks = [
    'a:has-text("Sign In")',
    'a:has-text("Login")',
    'a:has-text("Đăng nhập")',
    'button:has-text("Sign In")',
    'button:has-text("Login")',
    'button:has-text("Đăng nhập")'
  ];
  
  for (const selector of loginLinks) {
    if (await page.locator(selector).isVisible()) {
      await page.locator(selector).click();
      await page.waitForLoadState('networkidle');
      return;
    }
  }
  
  // If no login link found, try to navigate directly
  await page.goto('/sign-in');
  await page.waitForLoadState('networkidle');
}

/**
 * Helper to check authentication status and provide guidance
 */
export async function checkAuthStatus(page: Page): Promise<string> {
  if (await isAuthenticated(page)) {
    return 'authenticated';
  }
  
  // Check if there are login/signin elements
  const loginElements = [
    'a:has-text("Sign In")',
    'a:has-text("Login")',
    'a:has-text("Đăng nhập")',
    'button:has-text("Sign In")',
    'button:has-text("Login")',
    'button:has-text("Đăng nhập")'
  ];
  
  for (const selector of loginElements) {
    if (await page.locator(selector).isVisible()) {
      return 'login_available';
    }
  }
  
  return 'no_auth_available';
}
