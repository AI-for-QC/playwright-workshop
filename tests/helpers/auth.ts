import { expect, type Page } from '@playwright/test';

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Environment variable ${name} is not set (see .env)`);
  return value;
}

export type AdminSession = {
  /** Bearer token returned by the login API; used for API-level setup and cleanup. */
  accessToken: string;
  /** Origin of the backend API, taken from the real login request (e.g. http://localhost:8080). */
  apiOrigin: string;
};

/**
 * Logs in as admin through the login form and waits until the admin panel is open.
 * Credentials come from ADMIN_EMAIL / ADMIN_PASSWORD (.env).
 */
export async function loginAsAdmin(page: Page): Promise<AdminSession> {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Електронна пошта' }).fill(requireEnv('ADMIN_EMAIL'));
  await page.getByRole('textbox', { name: 'Пароль', exact: true }).fill(requireEnv('ADMIN_PASSWORD'));

  // The auth API takes ~2-3 s; wait for the real response instead of a fixed timeout.
  const loginResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname === '/api/auth/login',
  );
  await page.getByRole('button', { name: 'Увійти', exact: true }).click();
  const loginResponse = await loginResponsePromise;
  expect(loginResponse.ok(), 'login API must succeed').toBe(true);
  await expect(page).toHaveURL('/admin-panel');

  const { accessToken } = (await loginResponse.json()) as { accessToken: string };
  return { accessToken, apiOrigin: new URL(loginResponse.url()).origin };
}
