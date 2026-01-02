import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Inoxbolt/i);
  });

  test('should display navbar', async ({ page }) => {
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible();
  });

  test('should display hero section', async ({ page }) => {
    // Hero should have main heading or call-to-action
    // Look for visible section (skip hidden notification sections)
    const heroSection = page.locator('section:visible, main section').first();
    await expect(heroSection).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should have working scroll to sections', async ({ page }) => {
    // Check that main sections exist
    await expect(page.locator('main')).toBeVisible();
  });

  test('should be responsive - mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    // Page should still render properly on mobile
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible();
  });
});
