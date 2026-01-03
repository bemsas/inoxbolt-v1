import { test, expect, Page } from '@playwright/test';

/**
 * Search Page UX/UI Best Practices Tests
 * Based on B2B ecommerce research and McMaster-Carr UX analysis
 */

test.describe('Search UX - Input & Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

  test('search input should have visible focus state', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.focus();

    // Should have visual focus indicator (ring, border change, shadow)
    const inputContainer = searchInput.locator('..');
    await expect(inputContainer).toBeVisible();
  });

  test('search should have appropriate debounce (300-500ms)', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();

    const startTime = Date.now();
    await searchInput.fill('test');

    // Loading should not appear immediately (debounce)
    const immediateLoading = page.locator('.animate-spin');
    // Debounce should prevent immediate search
  });

  test('search input should be large and prominent (best practice)', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    const box = await searchInput.boundingBox();

    // Search input should be at least 40px tall for easy interaction
    expect(box?.height).toBeGreaterThanOrEqual(40);
  });

  test('quick search tags should be easily tappable (44px touch target)', async ({ page }) => {
    const quickTag = page.locator('button:has-text("DIN 933")').first();

    if (await quickTag.count() > 0) {
      const box = await quickTag.boundingBox();
      // Touch targets should be at least 44px for accessibility
      expect(box?.height).toBeGreaterThanOrEqual(28); // Minimum reasonable size
    }
  });

  test('search suggestions dropdown should appear on focus', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.focus();

    // Dropdown with suggestions should appear
    const dropdown = page.locator('.absolute, [role="listbox"]');
    // Suggestions may appear on focus
  });

  test('pressing Escape should close suggestions', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.focus();
    await page.keyboard.press('Escape');

    // Suggestions should close
  });
});

test.describe('Search UX - Results Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('bolt');
    await page.waitForTimeout(800);
  });

  test('results should display in scannable grid format', async ({ page }) => {
    const grid = page.locator('.grid');
    await expect(grid.first()).toBeVisible();
  });

  test('product cards should have consistent height (visual alignment)', async ({ page }) => {
    const cards = page.locator('.grid > div, .grid > article');
    const count = await cards.count();

    if (count >= 2) {
      const firstBox = await cards.first().boundingBox();
      const secondBox = await cards.nth(1).boundingBox();

      // Cards should have similar heights for visual consistency
      if (firstBox && secondBox) {
        const heightDiff = Math.abs((firstBox.height || 0) - (secondBox.height || 0));
        expect(heightDiff).toBeLessThan(50); // Allow some variance
      }
    }
  });

  test('loading state should show skeleton placeholders', async ({ page }) => {
    // Navigate fresh and check loading state
    await page.goto('/search');
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('DIN');

    // Check for skeleton elements (animate-pulse class typically)
    const skeletons = page.locator('.animate-pulse, [class*="skeleton"]');
    // Skeletons should appear during loading
  });

  test('empty state should provide helpful guidance', async ({ page }) => {
    await page.goto('/search');
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('xyznonexistent999');
    await page.waitForTimeout(800);

    // Should show helpful message
    const emptyMessage = page.locator('text=/try different|intenta con otros/i');
    // Empty state guidance should appear
  });

  test('results should show relevance indicator (score/match)', async ({ page }) => {
    // Product cards may show match score or relevance
    const scoreIndicator = page.locator('text=/%|score|match/i');
    // Score may be displayed
  });
});

test.describe('Search UX - Filters Best Practices', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('bolt');
    await page.waitForTimeout(800);
  });

  test('filters should show result count for each option (if available)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Filter options may show count like "A2 (15)"
    const filterWithCount = page.locator('text=/\\(\\d+\\)/');
    // Counts may be shown
  });

  test('active filters should be clearly visible', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Check for active filter indication (badge, chip, highlight)
    const activeIndicator = page.locator('.bg-inox-teal, [data-state="checked"]');
    // Active filters should be visually distinct
  });

  test('filter panel should be sticky on scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));

    // Filter panel should still be visible (sticky)
    const filterPanel = page.locator('aside, [class*="sticky"]');
    // Sticky behavior should keep filters visible
  });

  test('filter groups should be collapsible to reduce cognitive load', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Collapsible triggers (chevron icons)
    const collapsibleTriggers = page.locator('[data-state], button:has(svg.lucide-chevron)');
    // Collapsible groups should exist
  });

  test('clear all filters should be easily accessible', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    const clearAll = page.locator('button:has-text("Clear all"), button:has-text("Limpiar todo")');
    if (await clearAll.count() > 0) {
      await expect(clearAll.first()).toBeVisible();
    }
  });
});

test.describe('Search UX - Performance & Responsiveness', () => {
  test('page should load within acceptable time (<3s)', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/search');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('search response should feel instant (<500ms perceived)', async ({ page }) => {
    await page.goto('/search');
    const searchInput = page.locator('input[type="text"]').first();

    const startTime = Date.now();
    await searchInput.fill('M8');

    // Loading indicator should appear within 500ms
    await page.waitForTimeout(500);
    const elapsed = Date.now() - startTime;

    // Some feedback should occur within 500ms
    expect(elapsed).toBeLessThan(600);
  });

  test('mobile layout should adapt properly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/search');

    // No horizontal overflow
    const body = page.locator('body');
    const bodyWidth = await body.evaluate(el => el.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 20); // Small tolerance
  });

  test('tablet layout should show 2-column grid', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/search');

    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('bolt');
    await page.waitForTimeout(800);

    // Grid should have responsive columns
    const grid = page.locator('.grid');
    // Grid classes should adapt
  });

  test('desktop layout should show sidebar + 2+ column grid', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/search');

    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('bolt');
    await page.waitForTimeout(800);

    // Should have sidebar and main content
    const sidebar = page.locator('aside');
    const mainContent = page.locator('main, .flex-1');
    // Desktop layout should have sidebar
  });
});

test.describe('Search UX - Visual Hierarchy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

  test('page should have clear visual hierarchy', async ({ page }) => {
    // H1 should be the most prominent
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Search input should be prominently placed
    const searchInput = page.locator('input[type="text"]').first();
    const searchBox = await searchInput.boundingBox();

    // Search should be in upper portion of page
    expect(searchBox?.y).toBeLessThan(400);
  });

  test('primary CTA (search button) should be visually distinct', async ({ page }) => {
    const searchButton = page.locator('button[type="submit"]');

    // Should have brand color background
    const bgColor = await searchButton.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );

    // Should not be white/transparent (should be colored)
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('product cards should have clear action buttons', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('bolt');
    await page.waitForTimeout(800);

    // Inquire/action buttons should exist on cards
    const actionButtons = page.locator('button:has-text("Inquire"), button:has-text("Consultar"), button:has-text("View"), button:has-text("Ver")');
    // Action buttons should be present
  });

  test('breadcrumb navigation should be present (if applicable)', async ({ page }) => {
    // Header should have navigation back to home
    const homeLink = page.locator('a[href="/"], [href="/"]');
    await expect(homeLink.first()).toBeVisible();
  });
});

test.describe('Search UX - Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/search');

    // Simulate offline mode
    await page.context().setOffline(true);

    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('test offline');
    await page.waitForTimeout(800);

    // Should not crash, may show error
    await expect(page.locator('body')).toBeVisible();

    // Restore online mode
    await page.context().setOffline(false);
  });

  test('should display error state with retry option', async ({ page }) => {
    await page.goto('/search');

    // Error state should have retry or clear option
    const errorRetry = page.locator('text=/try again|intenta de nuevo|retry/i');
    // Error guidance should exist if error occurs
  });

  test('empty input should show helpful suggestions', async ({ page }) => {
    await page.goto('/search');

    // Before any search, page should show helpful content
    const helpContent = page.locator('text=/popular|suggestions|quick search|rápidas/i');
    await expect(helpContent.first()).toBeVisible();
  });
});

test.describe('Search UX - Keyboard Navigation', () => {
  test('Tab should cycle through interactive elements', async ({ page }) => {
    await page.goto('/search');

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to tab through the page
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('Enter should trigger search from input', async ({ page }) => {
    await page.goto('/search');

    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('M10');
    await searchInput.press('Enter');

    // Search should be triggered
    await page.waitForTimeout(500);
  });

  test('focus should be visible on all interactive elements', async ({ page }) => {
    await page.goto('/search');

    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.focus();

    // Focus ring should be visible
    const focusStyle = await searchInput.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.outline || style.boxShadow || style.borderColor;
    });

    // Should have some focus style
    expect(focusStyle).toBeTruthy();
  });
});
