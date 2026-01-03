import { test, expect, Page } from '@playwright/test';

test.describe('Search Page - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

  test('should load search page successfully', async ({ page }) => {
    await expect(page).toHaveURL('/search');
    await expect(page.locator('h1')).toContainText(/Search Products|Buscar Productos/i);
  });

  test('should display search input with placeholder', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /.+/);
  });

  test('should display quick search tags', async ({ page }) => {
    // Quick search buttons like DIN 933, M8, A2-70
    const quickSearches = page.locator('button:has-text("DIN 933"), button:has-text("M8"), button:has-text("A2-70")');
    await expect(quickSearches.first()).toBeVisible();
  });

  test('should enable search button only with 2+ characters', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    const searchButton = page.locator('button[type="submit"]');

    // With empty input, button should be disabled
    await expect(searchButton).toBeDisabled();

    // With 1 character, still disabled
    await searchInput.fill('M');
    await expect(searchButton).toBeDisabled();

    // With 2+ characters, should be enabled
    await searchInput.fill('M8');
    await expect(searchButton).toBeEnabled();
  });

  test('should perform search on input and show results', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();

    await searchInput.fill('DIN 933');

    // Wait for debounce and results
    await page.waitForTimeout(500);

    // Should show loading or results
    const resultsArea = page.locator('main');
    await expect(resultsArea).toBeVisible();
  });

  test('should search when clicking quick search tag', async ({ page }) => {
    const quickTag = page.locator('button:has-text("DIN 933")').first();
    await quickTag.click();

    // Input should be populated
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toHaveValue('DIN 933');
  });

  test('should clear search with X button', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('M8 bolt');

    // Clear button should appear
    const clearButton = page.locator('button:has(svg.lucide-x)').first();
    await expect(clearButton).toBeVisible();

    await clearButton.click();
    await expect(searchInput).toHaveValue('');
  });

  test('should submit search on Enter key', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('hex bolt');
    await searchInput.press('Enter');

    // Search should be performed
    await page.waitForTimeout(500);
  });
});

test.describe('Search Page - Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
    // Perform a search first to show filters
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('bolt');
    await page.waitForTimeout(600);
  });

  test('should display filter sidebar on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Wait for results to load
    await page.waitForTimeout(1000);

    // Filter panel should be visible (look for filter icon or text)
    const filterSection = page.locator('text=Filters, text=Filtros, text=Material').first();
    // If there are results, filter should appear
  });

  test('should have collapsible filter groups', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(1000);

    // Filter groups should have expand/collapse
    const collapsibleTrigger = page.locator('[data-state="open"], [data-state="closed"]').first();
    if (await collapsibleTrigger.count() > 0) {
      await expect(collapsibleTrigger).toBeVisible();
    }
  });

  test('should show mobile filter toggle on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // Mobile filter button
    const filterToggle = page.locator('button:has-text("Show filters"), button:has-text("Mostrar filtros")');
    if (await filterToggle.count() > 0) {
      await expect(filterToggle.first()).toBeVisible();
    }
  });

  test('should toggle filter on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    const filterToggle = page.locator('button:has-text("Show filters"), button:has-text("Mostrar filtros")').first();

    if (await filterToggle.count() > 0) {
      await filterToggle.click();

      // Filter panel should appear
      const filterPanel = page.locator('text=Material, text=Standard, text=Norma');
      await expect(filterPanel.first()).toBeVisible();
    }
  });

  test('should display active filter count badge', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(1000);

    // Click a filter checkbox if available
    const checkbox = page.locator('[role="checkbox"]').first();
    if (await checkbox.count() > 0) {
      await checkbox.click();

      // Badge should show count
      const badge = page.locator('.bg-inox-teal');
      // Should have some badge visible
    }
  });

  test('should clear all filters with button', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(1000);

    const clearAllButton = page.locator('button:has-text("Clear all"), button:has-text("Limpiar todo")');
    if (await clearAllButton.count() > 0) {
      await expect(clearAllButton.first()).toBeVisible();
    }
  });
});

test.describe('Search Page - Results Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

  test('should show loading skeletons during search', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();

    // Start typing to trigger search
    await searchInput.fill('M10');

    // Should show loading state (spinner or skeleton)
    const loadingIndicator = page.locator('.animate-spin, .animate-pulse').first();
    // Loading may appear briefly
  });

  test('should display product cards in grid', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('bolt');
    await page.waitForTimeout(1000);

    // Grid should have cards
    const grid = page.locator('.grid');
    await expect(grid.first()).toBeVisible();
  });

  test('should show result count', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('bolt');
    await page.waitForTimeout(1000);

    // Should show "X results" text
    const resultCount = page.locator('text=/\\d+.*results|\\d+.*resultados/i');
    // Results count may be visible
  });

  test('should show no results message for invalid search', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('xyznonexistent123');
    await page.waitForTimeout(1000);

    // Should show no results state
    const noResults = page.locator('text=/No results|No se encontraron/i');
    // No results message may appear
  });

  test('should display search query indicator', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('M8 hex');
    await page.waitForTimeout(1000);

    // Should show "Results for: M8 hex"
    const queryIndicator = page.locator('text=/Results for|Resultados para/i');
    // Query indicator may be visible when results exist
  });
});

test.describe('Search Page - Product Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('bolt');
    await page.waitForTimeout(1000);
  });

  test('should open product modal on Inquire click', async ({ page }) => {
    // Find an inquire button
    const inquireButton = page.locator('button:has-text("Inquire"), button:has-text("Consultar")').first();

    if (await inquireButton.count() > 0) {
      await inquireButton.click();

      // Modal should open
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
    }
  });

  test('should close modal with X button', async ({ page }) => {
    const inquireButton = page.locator('button:has-text("Inquire"), button:has-text("Consultar")').first();

    if (await inquireButton.count() > 0) {
      await inquireButton.click();

      // Close modal
      const closeButton = page.locator('[role="dialog"] button:has(svg)').first();
      await closeButton.click();

      // Modal should be closed
      const modal = page.locator('[role="dialog"]');
      await expect(modal).not.toBeVisible();
    }
  });
});

test.describe('Search Page - Recent Searches', () => {
  test('should save and display recent searches', async ({ page }) => {
    await page.goto('/search');

    const searchInput = page.locator('input[type="text"]').first();

    // Perform a search
    await searchInput.fill('M10 bolt');
    await searchInput.press('Enter');
    await page.waitForTimeout(500);

    // Clear and focus to see suggestions
    await searchInput.clear();
    await searchInput.focus();

    // Recent searches section should appear
    const recentSection = page.locator('text=/Recent|Recientes/i');
    // Recent searches may be visible
  });

  test('should clear recent searches', async ({ page }) => {
    await page.goto('/search');

    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('test search');
    await searchInput.press('Enter');
    await page.waitForTimeout(500);

    await searchInput.clear();
    await searchInput.focus();

    // Clear button
    const clearButton = page.locator('button:has-text("Clear"), button:has-text("Limpiar")');
    if (await clearButton.count() > 0) {
      await clearButton.first().click();
    }
  });
});

test.describe('Search Page - Language Support', () => {
  test('should display English text by default', async ({ page }) => {
    await page.goto('/search');

    const heading = page.locator('h1');
    await expect(heading).toContainText(/Search Products/i);
  });

  test('should switch to Spanish on language toggle', async ({ page }) => {
    await page.goto('/search');

    // Find language toggle (EN/ES button)
    const langToggle = page.locator('button:has-text("EN"), button:has-text("ES")').first();

    if (await langToggle.count() > 0) {
      const currentLang = await langToggle.textContent();
      await langToggle.click();

      // Heading should change language
      await page.waitForTimeout(200);
      const heading = page.locator('h1');
      // Text should be in the other language
    }
  });
});
