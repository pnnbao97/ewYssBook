# Playwright Testing Setup

This directory contains end-to-end tests for the ewYssBook application using Playwright.

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ installed
- Development server running on `http://localhost:3000`

### Installation

The Playwright dependencies are already installed. If you need to reinstall:

```bash
npm install -D @playwright/test
npx playwright install
```

## 📁 Test Structure

```
tests/
├── home.spec.ts          # Home page tests
├── product.spec.ts       # Product page tests
├── books.spec.ts         # Books listing tests
├── utils/
│   └── test-helpers.ts  # Common test utilities
├── global-setup.ts       # Global test setup
└── README.md            # This file
```

## 🧪 Running Tests

### Run all tests
```bash
npx playwright test
```

### Run specific test file
```bash
npx playwright test home.spec.ts
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

### Run tests on specific browser
```bash
npx playwright test --project=chromium
```

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## 🔧 Configuration

The Playwright configuration is in `playwright.config.ts` at the root of the project.

Key features:
- **Multi-browser testing**: Chrome, Firefox, Safari
- **Mobile testing**: Mobile Chrome and Safari
- **Auto-start dev server**: Automatically starts `npm run dev`
- **Screenshots on failure**: Automatic screenshots for failed tests
- **Video recording**: Records video for failed tests
- **Trace viewer**: Detailed traces for debugging

## 🎯 Test Categories

### 1. Home Page Tests (`home.spec.ts`)
- Page loading
- Book grid display
- Navigation functionality
- Search functionality

### 2. Product Page Tests (`product.spec.ts`)
- Product page loading
- Book details display
- Breadcrumb navigation
- Preview section
- Action buttons
- **Dev Purchase Feature** (development mode only)

### 3. Books Listing Tests (`books.spec.ts`)
- Books page loading
- Books grid display
- Category filters
- Search functionality
- Pagination
- Book card navigation

## 🛠️ Test Utilities

Common helper functions in `utils/test-helpers.ts`:

- `waitForPageLoad()` - Wait for page to fully load
- `isAuthenticated()` - Check if user is logged in
- `loginUser()` - Handle user authentication
- `expectElementVisible()` - Check element visibility
- `takeScreenshotOnFailure()` - Screenshot on test failure
- `mockAPIResponse()` - Mock API responses for testing

## 🧪 Writing New Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');
    
    // Your test logic here
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

### Using Test Utilities
```typescript
import { waitForPageLoad, expectElementVisible } from './utils/test-helpers';

test('should use helpers', async ({ page }) => {
  await page.goto('/path');
  await waitForPageLoad(page);
  
  const element = await expectElementVisible(page, 'selector');
  // element is now guaranteed to be visible
});
```

### Testing Authentication
```typescript
import { isAuthenticated, loginUser } from './utils/test-helpers';

test('should work for authenticated users', async ({ page }) => {
  if (!(await isAuthenticated(page))) {
    await loginUser(page, 'test@example.com', 'password');
  }
  
  // Your authenticated test logic
});
```

## 🔍 Debugging Tests

### View Test Results
```bash
npx playwright show-report
```

### Debug Individual Test
```bash
npx playwright test --debug test-name
```

### Trace Viewer
```bash
npx playwright show-trace trace.zip
```

## 📱 Browser Support

Tests run on:
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Mobile Chrome, Mobile Safari
- **CI**: Chromium only (faster execution)

## 🚨 Common Issues

### 1. Dev Server Not Running
Make sure your development server is running:
```bash
npm run dev
```

### 2. Authentication Issues
Some tests require user authentication. Use the helper functions:
```typescript
await loginUser(page, 'email', 'password');
```

### 3. Element Not Found
Use data-testid attributes for reliable element selection:
```typescript
// Good
await expect(page.locator('[data-testid="book-card"]')).toBeVisible();

// Avoid
await expect(page.locator('div.book-card')).toBeVisible();
```

### 4. Timing Issues
Use proper wait conditions:
```typescript
// Wait for element to be visible
await page.locator('selector').waitFor({ state: 'visible' });

// Wait for network idle
await page.waitForLoadState('networkidle');
```

## 📈 Continuous Integration

The Playwright configuration includes CI-specific settings:
- Retries on failure
- Single worker for stability
- Forbid `test.only()` in CI
- Automatic dev server startup

## 🎉 Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Write descriptive test names** that explain what is being tested
3. **Use page object models** for complex pages
4. **Handle authentication properly** using helper functions
5. **Clean up test data** after tests
6. **Use proper assertions** with descriptive messages
7. **Test both positive and negative scenarios**
8. **Keep tests independent** and avoid test interdependencies

## 🔗 Useful Links

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Debugging](https://playwright.dev/docs/debug)
