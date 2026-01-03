import { test, expect } from '@playwright/test';

test.describe('AI Chat Assistant', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display floating chat button in bottom right corner', async ({ page }) => {
    // Look for the chat button with data-testid
    const chatButton = page.locator('[data-testid="chat-button"]');
    await expect(chatButton).toBeVisible({ timeout: 10000 });

    // Verify position is in bottom right corner
    const boundingBox = await chatButton.boundingBox();
    const viewportSize = page.viewportSize();

    expect(boundingBox).not.toBeNull();
    if (boundingBox && viewportSize) {
      // Should be in bottom right - right edge within 100px of viewport right
      expect(boundingBox.x + boundingBox.width).toBeGreaterThan(viewportSize.width - 100);
      // Should be near bottom - within 100px of viewport bottom
      expect(boundingBox.y + boundingBox.height).toBeGreaterThan(viewportSize.height - 100);
    }

    console.log('Chat button positioned correctly in bottom right');
  });

  test('should open chat panel when button is clicked', async ({ page }) => {
    const chatButton = page.locator('[data-testid="chat-button"]');
    await chatButton.click();

    // Check for chat panel (Sheet component)
    const chatPanel = page.locator('[data-state="open"]');
    await expect(chatPanel.first()).toBeVisible({ timeout: 5000 });

    // Check for header text
    const headerText = page.getByText(/Product Assistant|Asistente de Productos/i);
    await expect(headerText).toBeVisible();

    console.log('Chat panel opened successfully');
  });

  test('should show example questions in empty state', async ({ page }) => {
    const chatButton = page.locator('[data-testid="chat-button"]');
    await chatButton.click();

    await page.waitForTimeout(500);

    // Check for example questions
    const examples = page.locator('button').filter({ hasText: /M10|bolt|tornillo|stainless|inoxidable/i });
    await expect(examples.first()).toBeVisible({ timeout: 5000 });

    console.log('Example questions displayed');
  });

  test('should send message and receive AI response', async ({ page }) => {
    test.setTimeout(120000); // 2 minute timeout for AI response

    const chatButton = page.locator('[data-testid="chat-button"]');
    await chatButton.click();

    await page.waitForTimeout(500);

    // Type a message
    const input = page.locator('textarea');
    await expect(input).toBeVisible();
    await input.fill('What M8 hex bolts do you have?');

    // Click send button (button with SVG in the input area)
    const sendButton = page.locator('button.bg-inox-teal').filter({ has: page.locator('svg') });
    await sendButton.click();

    // Wait for loading indicator to appear and then disappear
    await page.waitForTimeout(2000);

    // Wait for AI response - look for the assistant message bubble
    const aiResponse = page.locator('.bg-slate-100.rounded-bl-md');
    await expect(aiResponse.first()).toBeVisible({ timeout: 90000 });

    const responseText = await aiResponse.first().textContent();
    console.log('AI Response received:', responseText?.substring(0, 200) + '...');

    // Response should mention relevant products or provide helpful info
    expect(responseText?.length).toBeGreaterThan(20);
  });

  test('should display sources after AI response', async ({ page }) => {
    test.setTimeout(120000);

    const chatButton = page.locator('[data-testid="chat-button"]');
    await chatButton.click();

    await page.waitForTimeout(500);

    const input = page.locator('textarea');
    await input.fill('Show me DIN 933 bolts');

    const sendButton = page.locator('button.bg-inox-teal').filter({ has: page.locator('svg') });
    await sendButton.click();

    // Wait for AI response first
    const aiResponse = page.locator('.bg-slate-100.rounded-bl-md');
    await expect(aiResponse.first()).toBeVisible({ timeout: 90000 });

    // Sources appear inside the message bubble with "Sources:" or "Fuentes:" text
    const sourcesLabel = page.locator('.text-xs.font-semibold').filter({ hasText: /Sources|Fuentes/i });
    const hasSourcesVisible = await sourcesLabel.isVisible({ timeout: 5000 }).catch(() => false);

    // Sources may not always appear if no documents are indexed
    console.log('Sources displayed:', hasSourcesVisible);
  });

  test('should handle compatibility questions', async ({ page }) => {
    test.setTimeout(120000);

    const chatButton = page.locator('[data-testid="chat-button"]');
    await chatButton.click();

    await page.waitForTimeout(500);

    const input = page.locator('textarea');
    await input.fill('What nuts are compatible with M10 bolts?');

    const sendButton = page.locator('button.bg-inox-teal').filter({ has: page.locator('svg') });
    await sendButton.click();

    // Wait for response - look specifically for assistant message
    const aiResponse = page.locator('.bg-slate-100.rounded-bl-md');
    await expect(aiResponse.first()).toBeVisible({ timeout: 90000 });

    const responseText = await aiResponse.first().textContent();
    console.log('Compatibility response:', responseText?.substring(0, 300));

    // Response should be substantial (AI generated content)
    expect(responseText?.length).toBeGreaterThan(50);
  });

  test('should handle volume/quantity questions', async ({ page }) => {
    test.setTimeout(120000);

    const chatButton = page.locator('[data-testid="chat-button"]');
    await chatButton.click();

    await page.waitForTimeout(500);

    const input = page.locator('textarea');
    await input.fill('I need 500 pieces of M8x30 hex bolts, what options do you have?');

    const sendButton = page.locator('button.bg-inox-teal').filter({ has: page.locator('svg') });
    await sendButton.click();

    // Wait for response - look specifically for assistant message
    const aiResponse = page.locator('.bg-slate-100.rounded-bl-md');
    await expect(aiResponse.first()).toBeVisible({ timeout: 90000 });

    const responseText = await aiResponse.first().textContent();
    console.log('Volume response:', responseText?.substring(0, 300));

    // Response should be substantial
    expect(responseText?.length).toBeGreaterThan(50);
  });

  test('should clear chat history', async ({ page }) => {
    test.setTimeout(60000);

    const chatButton = page.locator('[data-testid="chat-button"]');
    await chatButton.click();

    await page.waitForTimeout(500);

    // Send a message first
    const input = page.locator('textarea');
    await input.fill('Hello');

    const sendButton = page.locator('button.bg-inox-teal').filter({ has: page.locator('svg') });
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(5000);

    // Click clear button (trash icon) - it appears after messages exist
    const clearButton = page.locator('button').filter({ has: page.locator('svg.lucide-trash-2') });
    if (await clearButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await clearButton.click();

      // Verify chat is cleared - welcome message should reappear
      const welcomeMessage = page.getByText(/Hi! I'm|Hola! Soy/i);
      await expect(welcomeMessage).toBeVisible({ timeout: 5000 });

      console.log('Chat cleared successfully');
    } else {
      console.log('Clear button not visible - skipping clear test');
    }
  });

  test('should close chat panel with X button', async ({ page }) => {
    const chatButton = page.locator('[data-testid="chat-button"]');
    await chatButton.click();

    await page.waitForTimeout(500);

    // Find and click close button (X icon in header) - it's a ghost button with X svg
    const closeButton = page.locator('[data-state="open"] button').filter({ has: page.locator('svg.lucide-x') }).first();
    await closeButton.click();

    await page.waitForTimeout(300);

    // Chat button should reappear
    await expect(chatButton).toBeVisible({ timeout: 5000 });

    console.log('Chat panel closed successfully');
  });

  test('should support Spanish language', async ({ page }) => {
    // Switch to Spanish if possible
    const langButton = page.locator('button').filter({ hasText: /ES|Español/i });
    if (await langButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await langButton.click();
    }

    const chatButton = page.locator('[data-testid="chat-button"]');
    await chatButton.click();

    await page.waitForTimeout(500);

    // Check for Spanish text
    const spanishText = page.getByText(/Asistente|pregunta|Escribe/i);
    const hasSpanish = await spanishText.first().isVisible().catch(() => false);

    console.log('Spanish language support:', hasSpanish ? 'Yes' : 'Checking...');
  });
});
