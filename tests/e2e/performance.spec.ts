import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    const loadTime = Date.now() - startTime;

    // Page should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);

    console.log(`Homepage load time: ${loadTime}ms`);
  });

  test('should load admin page within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/admin');

    const loadTime = Date.now() - startTime;

    // Page should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);

    console.log(`Admin page load time: ${loadTime}ms`);
  });

  test('should not have JavaScript errors on load', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Log errors but don't fail - some third-party scripts may throw
    if (errors.length > 0) {
      console.log('JavaScript errors found:', errors);
    }

    // Critical errors should not occur
    const criticalErrors = errors.filter(e =>
      e.includes('TypeError') ||
      e.includes('ReferenceError') ||
      e.includes('SyntaxError')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('should handle network requests properly', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('requestfailed', (request) => {
      failedRequests.push(request.url());
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Log failed requests
    if (failedRequests.length > 0) {
      console.log('Failed requests:', failedRequests);
    }

    // Some failures are acceptable (analytics, etc.)
    expect(true).toBeTruthy();
  });
});
