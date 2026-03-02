
import { test, expect } from '@playwright/test';

test('debug admin', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.screenshot({ path: 'debug_login.png' });
  console.log('Title:', await page.title());
});
