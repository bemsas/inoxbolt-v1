import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Upload PDF Documents', () => {
  test('upload REYHER Catalogue (26MB)', async ({ page }) => {
    test.setTimeout(300000); // 5 minute timeout for large file

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached({ timeout: 10000 });

    const pdfPath = path.resolve(__dirname, '../REYHER_Catalogue_2020_04_EN_Web_ks.pdf');
    console.log('Uploading:', pdfPath);
    await fileInput.setInputFiles(pdfPath);

    // Wait for upload progress to start
    await page.waitForSelector('text=Uploading', { timeout: 30000 }).catch(() => {});

    // Wait for processing to complete - can take several minutes
    await page.waitForFunction(
      () => {
        const table = document.querySelector('table');
        if (!table) return false;
        const text = table.textContent || '';
        return text.includes('REYHER_Catalogue') &&
               (text.includes('completed') || text.includes('Completed'));
      },
      { timeout: 240000 }
    );

    console.log('REYHER Catalogue uploaded and processed');
  });

  test('upload Product Catalog (93MB)', async ({ page }) => {
    test.setTimeout(600000); // 10 minute timeout for very large file

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached({ timeout: 10000 });

    const pdfPath = path.resolve(__dirname, '../product_catalog-2024-en.pdf');
    console.log('Uploading:', pdfPath);
    await fileInput.setInputFiles(pdfPath);

    // Wait for upload progress to start
    await page.waitForSelector('text=Uploading', { timeout: 30000 }).catch(() => {});

    // Wait for processing to complete - can take up to 10 minutes for 93MB
    await page.waitForFunction(
      () => {
        const table = document.querySelector('table');
        if (!table) return false;
        const text = table.textContent || '';
        return text.includes('product_catalog-2024') &&
               (text.includes('completed') || text.includes('Completed'));
      },
      { timeout: 540000 }
    );

    console.log('Product Catalog uploaded and processed');
  });
});
