import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads
    await expect(page).toHaveTitle(/ewYssBook/);
    
    // Check if header is present
    await expect(page.locator('header')).toBeVisible();
    
    // Check if main content is loaded
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display book grid', async ({ page }) => {
    await page.goto('/');
    
    // Check if book grid is present
    await expect(page.locator('[data-testid="book-grid"]')).toBeVisible();
    
    // Check if at least one book card is displayed
    const bookCards = page.locator('[data-testid="book-card"]');
    await expect(bookCards.first()).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check if navigation links are present
    await expect(page.locator('nav')).toBeVisible();
    
    // Check if books link works
    const booksLink = page.locator('a[href="/sach"]');
    await expect(booksLink).toBeVisible();
    
    // Click on books link
    await booksLink.click();
    await expect(page).toHaveURL('/sach');
  });

  test('should have working search functionality', async ({ page }) => {
    await page.goto('/');
    
    // Check if search input is present
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    await expect(searchInput).toBeVisible();
    
    // Type in search
    await searchInput.fill('test book');
    await searchInput.press('Enter');
    
    // Should navigate to search results
    await expect(page).toHaveURL(/search=test%20book/);
  });
});
