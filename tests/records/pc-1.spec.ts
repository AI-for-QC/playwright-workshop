import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://victorycenter.online/login');
  await expect(page.getByRole('heading')).toContainText('Вхід до системи');
  await page.getByRole('textbox', { name: 'Електронна пошта' }).click();
  await page.getByRole('textbox', { name: 'Електронна пошта' }).fill('admin@example.com');
  await page.getByRole('textbox', { name: 'Електронна пошта' }).click();
  await page.getByRole('textbox', { name: 'Електронна пошта' }).press('Tab');
  await page.getByRole('textbox', { name: 'Пароль' }).fill('password');
  await page.getByRole('textbox', { name: 'Пароль' }).press('Tab');
  await page.getByTestId('visibility-toggle-button').press('Tab');
  await page.getByRole('button', { name: 'Увійти' }).press('Tab');
  await page.getByRole('button', { name: 'Увійти' }).click();
  await page.getByRole('button', { name: 'Увійти' }).click();
  await page.getByRole('button', { name: 'Увійти' }).click();
  await page.goto('https://victorycenter.online/admin-panel');
  await expect(page.locator('#root')).toContainText('Вітаємо в панелі адміністратора');
  await page.getByRole('link', { name: 'Команда' }).click();
  await page.getByRole('button', { name: 'Додати в команду' }).click();
  await page.getByRole('button', { name: 'Оберіть категорію' }).click();
  await expect(page.getByRole('button', { name: 'Оберіть категорію' })).toBeVisible();
  await page.getByRole('button', { name: 'Оберіть категорію' }).click();
  await page.getByTestId('modal-overlay').getByRole('button', { name: 'Додати в команду' }).click();
});