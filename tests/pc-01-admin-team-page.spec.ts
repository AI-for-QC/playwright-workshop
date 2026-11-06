import { test, expect } from '@playwright/test';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Environment variable ${name} is not set (see .env)`);
  return value;
}

test.describe('PC-01: An admin is logged in and is on the admin Team page', () => {
  test('admin logs in through the login form and opens the Team page from the navigation', async ({ page }) => {
    const email = requireEnv('ADMIN_EMAIL');
    const password = requireEnv('ADMIN_PASSWORD');

    await test.step('Open the login page', async () => {
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: 'Вхід до системи' })).toBeVisible();
    });

    await test.step('Log in as admin', async () => {
      await page.getByRole('textbox', { name: 'Електронна пошта' }).fill(email);
      await page.getByRole('textbox', { name: 'Пароль', exact: true }).fill(password);

      // The auth API answers in ~2-3 s (measured), longer than the default 5 s expect window
      // allows on a cold start. Wait for the real response instead of a fixed timeout.
      const loginResponse = page.waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          new URL(response.url()).pathname === '/api/auth/login',
      );
      await page.getByRole('button', { name: 'Увійти', exact: true }).click();
      expect((await loginResponse).ok(), 'login API must succeed').toBe(true);

      // "Admin is logged in": redirect to the admin panel + welcome text + logout control.
      await expect(page).toHaveURL('/admin-panel');
      await expect(page.getByText('Вітаємо в панелі адміністратора')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Вихід', exact: true })).toBeVisible();
    });

    await test.step('Open the admin Team page', async () => {
      await page
        .getByRole('navigation')
        .getByRole('link', { name: 'Команда', exact: true })
        .click();

      await expect(page).toHaveURL('/admin-panel/team');
      // The page-level "Додати в команду" button exists only on the admin Team page.
      await expect(page.getByRole('button', { name: 'Додати в команду', exact: true })).toBeVisible();
    });
  });
});
