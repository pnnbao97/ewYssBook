import { test, expect } from '@playwright/test';

test.describe('Books Listing Page', () => {
  test('should load books page successfully', async ({ page }) => {
    await page.goto('/sach');
    
    // Check if the page loads
    await expect(page).toHaveTitle(/ewYssBook/);
    
    // Check if header is present
    await expect(page.locator('header')).toBeVisible();
    
    // Check if sidebar is present
    await expect(page.locator('aside')).toBeVisible();
    
    // Check if main content is loaded
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display books grid', async ({ page }) => {
    await page.goto('/sach');
    
    // Check if books grid is present
    await expect(page.locator('[data-testid="books-grid"]')).toBeVisible();
    
    // Check if at least one book card is displayed
    const bookCards = page.locator('[data-testid="book-card"]');
    await expect(bookCards.first()).toBeVisible();
  });

  test('should have working category filters', async ({ page }) => {
    await page.goto('/sach');
    
    // Check if category filters are present
    const categoryFilters = page.locator('[data-testid="category-filter"]');
    await expect(categoryFilters.first()).toBeVisible();
    
    // Click on a category filter
    await categoryFilters.first().click();
    
    // Should filter the books
    await expect(page.locator('[data-testid="books-grid"]')).toBeVisible();
  });

  test('should handle search functionality', async ({ page }) => {
    await page.goto('/sach?search=test');
    
    // Check if search query is applied
    await expect(page).toHaveURL(/search=test/);
    
    // Check if filtered results are displayed
    await expect(page.locator('[data-testid="books-grid"]')).toBeVisible();
  });

  test('should have working pagination', async ({ page }) => {
    await page.goto('/sach');
    
    // Check if pagination is present (if there are many books)
    const pagination = page.locator('[data-testid="pagination"]');
    
    if (await pagination.isVisible()) {
      // Check if pagination controls work
      const nextButton = pagination.locator('button:has-text("Next")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        // Should navigate to next page
        await expect(page).toHaveURL(/page=2/);
      }
    }
  });

  test('should display book details correctly', async ({ page }) => {
    await page.goto('/sach');
    
    // Get first book card
    const firstBookCard = page.locator('[data-testid="book-card"]').first();
    await expect(firstBookCard).toBeVisible();
    
    // Check if book title is displayed
    await expect(firstBookCard.locator('h3')).toBeVisible();
    
    // Check if book author is displayed
    await expect(firstBookCard.locator('text=bởi')).toBeVisible();
    
    // Check if book price is displayed
    await expect(firstBookCard.locator('[data-testid="book-price"]')).toBeVisible();
  });

  test('should navigate to book detail page', async ({ page }) => {
    await page.goto('/sach');
    
    // Get first book card
    const firstBookCard = page.locator('[data-testid="book-card"]').first();
    
    // Click on the book card
    await firstBookCard.click();
    
    // Should navigate to book detail page
    await expect(page).toHaveURL(/\/product\//);
    
    // Check if book detail content is loaded
    await expect(page.locator('h1')).toBeVisible();
  });
});
