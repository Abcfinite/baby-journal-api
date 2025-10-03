// automation.ts
import { chromium, type BrowserContext, type Page } from 'playwright';

/**
 * Main automation function.
 */
async function runAutomation(): Promise<void> {
  const userDataDir = './user-data';
  // 1. Launch a persistent browser context
  const context: BrowserContext = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    channel: 'chrome',
  });

  // 2. Use the first page of the context
  const page: Page = context.pages()[0];

  try {
    console.log(`Navigating to the target page...`);
    // Navigate to a URL
    await page.goto('https://www.bet365.com.au');

    // Wait for the search input to be available
    await page.waitForSelector('input.sml-SearchTextInput');

    // Wait for 30 seconds
    await page.waitForTimeout(30000);

    // Optional: Take a screenshot
    await page.screenshot({ path: 'search_result.png' });

  } catch (error) {
    console.error('An error occurred during automation:', error);
  } finally {
    // 7. Close the browser context
    await context.close();
  }
}

// Execute the main function
runAutomation()
  .catch(console.error);
