test.use({ ...devices['iPhone 12'] });
import { test, expect, devices } from '@playwright/test';

// Emulate a common mobile device with touch support
test.use({ ...devices['iPhone 12'] });

const BASE = 'http://localhost:8888';

async function swipeWithPointer(page: any, selector: string, startX: number, endX: number, y: number, steps = 6) {
  // Use pointer events with pointerType 'touch' so the app's pointer handlers run
  const elHandle = await page.$(selector);
  if (!elHandle) throw new Error('element not found');

  // pointerdown
  await page.dispatchEvent(selector, 'pointerdown', { clientX: startX, clientY: y, pointerType: 'touch', pointerId: 1 });

  // pointermove steps
  for (let i = 1; i <= steps; i++) {
    const xi = Math.round(startX + ((endX - startX) * i) / steps);
    await page.dispatchEvent(selector, 'pointermove', { clientX: xi, clientY: y, pointerType: 'touch', pointerId: 1 });
    // small delay to simulate real gesture
    await page.waitForTimeout(20);
  }

  // pointerup
  await page.dispatchEvent(selector, 'pointerup', { clientX: endX, clientY: y, pointerType: 'touch', pointerId: 1 });
}

test('swipe left and right changes tabs on mobile', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForSelector('.tabs-root');

  const initial = await page.locator('.tab-trigger.is-active').innerText();

  const root = page.locator('.tabs-root');
  const box = await root.boundingBox();
  if (!box) throw new Error('Could not measure tabs root');

  const startX = box.x + box.width * 0.8;
  const endX = box.x + box.width * 0.2;
  const y = box.y + box.height / 2;

  await swipeWithPointer(page, '.tabs-root', startX, endX, y);
  await page.waitForSelector('.tab-trigger.is-active');
  const afterSwipe = await page.locator('.tab-trigger.is-active').innerText();
  expect(afterSwipe).not.toBe(initial);

  // Swipe right to go back
  await swipeWithPointer(page, '.tabs-root', endX, startX, y);
  await page.waitForSelector('.tab-trigger.is-active');
  const final = await page.locator('.tab-trigger.is-active').innerText();
  expect(final).toBe(initial);
});
