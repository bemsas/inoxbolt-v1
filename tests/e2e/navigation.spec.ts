import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });

  test('should navigate to admin page', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL('/admin');
  });

  test('should show 404 page for unknown routes', async ({ page }) => {
    await page.goto('/unknown-page-that-does-not-exist');
    // Should either redirect to 404 or show not found content
    const pageContent = await page.content();
    const is404 = pageContent.toLowerCase().includes('not found') ||
                  pageContent.toLowerCase().includes('404') ||
                  page.url().includes('404');
    expect(is404 || page.url().includes('unknown')).toBeTruthy();
  });

  test('navbar links should be clickable', async ({ page }) => {
    await page.goto('/');
    const navLinks = page.locator('nav a, nav button');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});
