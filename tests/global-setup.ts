import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  if (!baseURL) {
    console.warn('No baseURL configured, skipping global setup');
    return;
  }

  console.log(`Setting up test environment for: ${baseURL}`);
  
  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    await page.goto(baseURL);
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the application is accessible
    const title = await page.title();
    console.log(`Application title: ${title}`);
    
    // You can add more setup logic here, such as:
    // - Creating test users
    // - Setting up test data
    // - Configuring authentication
    // - Setting up database state
    
    console.log('Global setup completed successfully');
    
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
