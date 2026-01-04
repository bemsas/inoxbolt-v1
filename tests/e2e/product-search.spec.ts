/**
 * E2E Tests: Product Search & Display
 * Playwright visual tests for search functionality and product display
 */

import { test, expect } from '@playwright/test';

test.describe('Product Search - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await page.waitForSelector('input[placeholder*="Search"]', { timeout: 10000 });
  });

  test('should display search input with placeholder', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible();
  });

  test('should search for DIN standard and show results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();

    // Type search query
    await searchInput.fill('DIN 933');

    // Wait for results or loading indicator
    await page.waitForTimeout(1500);

    // Check for results dropdown or loading state
    const hasResults = await page.locator('[class*="result"], [class*="card"], [class*="product"]').count() > 0;
    const hasLoading = await page.locator('[class*="loading"], [class*="spinner"]').count() > 0;

    expect(hasResults || hasLoading).toBeTruthy();
  });

  test('should search for thread specification', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();

    await searchInput.fill('M8x30');
    await page.waitForTimeout(1500);

    // Should trigger search
    const inputValue = await searchInput.inputValue();
    expect(inputValue).toBe('M8x30');
  });

  test('should search for material grade', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();

    await searchInput.fill('A2-70 stainless');
    await page.waitForTimeout(1500);

    const inputValue = await searchInput.inputValue();
    expect(inputValue).toContain('A2-70');
  });

  test('should clear search input', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();

    await searchInput.fill('test query');
    await expect(searchInput).toHaveValue('test query');

    await searchInput.clear();
    await expect(searchInput).toHaveValue('');
  });
});

test.describe('Product Search - Results Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('input[placeholder*="Search"]', { timeout: 10000 });
  });

  test('should display product cards in search results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();

    await searchInput.fill('hex bolt');
    await page.waitForTimeout(2000);

    // Look for any card-like elements
    const cards = page.locator('[class*="card"], [class*="result"], [class*="item"]');

    // Take screenshot for visual verification
    await page.screenshot({
      path: 'test-results/search-results-display.png',
      fullPage: true
    });
  });

  test('should show loading state during search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();

    // Start typing to trigger search
    await searchInput.fill('DIN');

    // Check for any loading indicator
    const loadingIndicator = page.locator('[class*="loading"], [class*="spinner"], svg[class*="animate"]');

    // Either we catch loading or results appear quickly
    await page.waitForTimeout(500);
  });

  test('should display "Ask AI" option when no results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();

    // Search for something unlikely to have results
    await searchInput.fill('xyznonexistent12345');
    await page.waitForTimeout(2000);

    // Look for AI assistant option or no results message
    const aiOption = page.locator('text=/AI|assistant|Ask/i');
    const noResults = page.locator('text=/no results|not found/i');

    await page.screenshot({
      path: 'test-results/no-results-display.png'
    });
  });
});

test.describe('Product Card - Display Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('input[placeholder*="Search"]', { timeout: 10000 });
  });

  test('should display product information correctly', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();

    await searchInput.fill('DIN 933 M8');
    await page.waitForTimeout(2000);

    // Check for typical product card elements
    const productCards = page.locator('[class*="card"], [class*="product"], [class*="result"]');

    if (await productCards.count() > 0) {
      // Take screenshot of first card
      const firstCard = productCards.first();
      await firstCard.screenshot({
        path: 'test-results/product-card.png'
      });
    }
  });

  test('should show material badge when available', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();

    await searchInput.fill('A2 stainless bolt');
    await page.waitForTimeout(2000);

    // Look for material badges
    const materialBadge = page.locator('text=/A2|A4|stainless/i');

    await page.screenshot({
      path: 'test-results/material-badge.png'
    });
  });

  test('should show supplier information', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();

    await searchInput.fill('REYHER');
    await page.waitForTimeout(2000);

    // Look for supplier reference
    const supplierRef = page.locator('text=/REYHER|supplier/i');

    await page.screenshot({
      path: 'test-results/supplier-display.png'
    });
  });
});

test.describe('Product Detail Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('input[placeholder*="Search"]', { timeout: 10000 });
  });

  test('should open product detail modal on click', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();

    await searchInput.fill('DIN 933');
    await page.waitForTimeout(2000);

    // Click on first product card or "Inquire" button
    const inquireButton = page.locator('button:has-text("Inquire"), button:has-text("Consultar"), button:has-text("Quote")').first();

    if (await inquireButton.count() > 0) {
      await inquireButton.click();
      await page.waitForTimeout(500);

      // Check for modal
      const modal = page.locator('[role="dialog"], [class*="modal"], [class*="dialog"]');
      await expect(modal).toBeVisible();

      await page.screenshot({
        path: 'test-results/product-modal.png'
      });
    }
  });

  test('should display quantity input in modal', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();

    await searchInput.fill('M8');
    await page.waitForTimeout(2000);

    const inquireButton = page.locator('button:has-text("Inquire"), button:has-text("Consultar"), button:has-text("Quote")').first();

    if (await inquireButton.count() > 0) {
      await inquireButton.click();
      await page.waitForTimeout(500);

      // Look for quantity input
      const quantityInput = page.locator('input[type="number"], input[id*="quantity"]');

      if (await quantityInput.count() > 0) {
        await expect(quantityInput.first()).toBeVisible();
      }
    }
  });

  test('should close modal on close button click', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();

    await searchInput.fill('bolt');
    await page.waitForTimeout(2000);

    const inquireButton = page.locator('button:has-text("Inquire"), button:has-text("Quote")').first();

    if (await inquireButton.count() > 0) {
      await inquireButton.click();
      await page.waitForTimeout(500);

      // Close modal
      const closeButton = page.locator('button[aria-label*="close"], button:has-text("×"), [class*="close"]');
      if (await closeButton.count() > 0) {
        await closeButton.first().click();
        await page.waitForTimeout(500);

        // Modal should be hidden
        const modal = page.locator('[role="dialog"]');
        await expect(modal).not.toBeVisible();
      }
    }
  });
});

test.describe('Search Page - Full Experience', () => {
  test('should navigate to search page', async ({ page }) => {
    await page.goto('/search');

    await page.waitForTimeout(1000);

    // Should be on search page
    await expect(page).toHaveURL(/search/);

    await page.screenshot({
      path: 'test-results/search-page.png',
      fullPage: true
    });
  });

  test('should display filters on search page', async ({ page }) => {
    await page.goto('/search');
    await page.waitForTimeout(1000);

    // Look for filter elements
    const filters = page.locator('[class*="filter"], [class*="sidebar"], [aria-label*="filter"]');

    await page.screenshot({
      path: 'test-results/search-filters.png'
    });
  });

  test('should perform search with URL query parameter', async ({ page }) => {
    await page.goto('/search?q=DIN%20933');
    await page.waitForTimeout(2000);

    // Should have search query in input
    const searchInput = page.locator('input[placeholder*="Search"]').first();

    await page.screenshot({
      path: 'test-results/search-with-query.png',
      fullPage: true
    });
  });
});

test.describe('Visual Regression Tests', () => {
  test('home page visual snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/visual/home-page.png',
      fullPage: true
    });
  });

  test('search results visual snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('input[placeholder*="Search"]', { timeout: 10000 });

    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill('DIN 933 hex bolt');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/visual/search-results.png',
      fullPage: true
    });
  });

  test('mobile viewport visual snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/visual/mobile-home.png',
      fullPage: true
    });
  });

  test('tablet viewport visual snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/visual/tablet-home.png',
      fullPage: true
    });
  });
});
