import { expect, type APIRequestContext, type Locator, type Page } from '@playwright/test';
import { requireEnv, type AdminSession } from './auth';

/** Category A from TM-01 (PC-2). The name differs per environment, see TEAM_CATEGORY_A in .env. */
export const CATEGORY_A = requireEnv('TEAM_CATEGORY_A');
export const VALID_DESCRIPTION = 'Досвідчений тренер з тестування';
export const VALID_PHOTO = 'tests/fixtures/photo_320x400.jpg';

/** Name may contain only letters, spaces, ’ and -, so the unique suffix is made of letters, not digits. */
export function uniqueValidName(): string {
  const letters = 'абвгдежзик';
  const suffix = Date.now().toString().slice(-6).replace(/\d/g, (d) => letters[Number(d)]);
  return `Олена Петренко ${suffix}`;
}

export function authHeaders(session: AdminSession) {
  return { Authorization: `Bearer ${session.accessToken}` };
}

type TeamCategory = { id: number; name: string; teamMembersCount: number };

export async function getCategory(request: APIRequestContext, session: AdminSession, name: string) {
  const response = await request.get(`${session.apiOrigin}/api/TeamCategories`, { headers: authHeaders(session) });
  expect(response.ok(), 'GET /api/TeamCategories must succeed').toBe(true);
  const category = ((await response.json()) as TeamCategory[]).find((c) => c.name === name);
  expect(category, `PC-2: team category "${name}" must exist`).toBeDefined();
  return category!;
}

export async function deleteMember(request: APIRequestContext, session: AdminSession, id: number) {
  const response = await request.delete(`${session.apiOrigin}/api/TeamMembers/${id}`, { headers: authHeaders(session) });
  expect(response.ok(), `cleanup: DELETE /api/TeamMembers/${id}`).toBe(true);
}

/** PC-1: from the admin panel, open the admin Team page through the navigation. */
export async function openAdminTeamPage(page: Page) {
  await page.getByRole('navigation').getByRole('link', { name: 'Команда', exact: true }).click();
  await expect(page).toHaveURL('/admin-panel/team');
}

/** Locators of the «Додати в команду» modal (confirmed in docs/tm-01-modal-locators.md). */
export function addMemberModal(page: Page) {
  // Confirmation dialogs reuse the same modal component, so the form modal is identified by its own button.
  const modal = page.getByTestId('modal-overlay').filter({
    has: page.getByRole('button', { name: 'Зберегти як чернетку' }),
  });
  return {
    root: modal,
    title: modal.getByText('Додати в команду', { exact: true }),
    closeButton: modal.getByRole('button', { name: 'Close modal' }),
    categoryEmpty: modal.getByRole('button', { name: 'Оберіть категорію' }),
    categoryOption: (name: string) => modal.getByRole('option', { name, exact: true }),
    nameField: modal.getByLabel("Ім'я та Прізвище"),
    nameCounter: modal.locator('#fullName-character-count'),
    descriptionField: modal.getByLabel('Опис'),
    descriptionCounter: modal.locator('#description-character-count'),
    photoDropZone: modal.getByRole('button', { name: 'Перетягніть файл сюди або натисніть для завантаження' }),
    photoInput: modal.getByTestId('image-input-hidden'),
    photoPreview: modal.getByTestId('preview-image'),
    draftButton: modal.getByRole('button', { name: 'Зберегти як чернетку' }),
    publishButton: modal.getByRole('button', { name: 'Опублікувати' }),
  };
}

/** Confirmation dialog shown after the Draft or Publish button, identified by its question text. */
export function confirmDialog(page: Page, question: string) {
  return page.getByTestId('modal-overlay').filter({ hasText: question });
}

/** Starts waiting for POST /api/TeamMembers; await the result to get the created member id. */
export function waitForCreatedMember(page: Page) {
  return page
    .waitForResponse(
      (response) =>
        response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/TeamMembers',
    )
    .then(async (response) => {
      expect(response.ok(), 'POST /api/TeamMembers must succeed').toBe(true);
      return ((await response.json()) as { id: number }).id;
    });
}

/** Admin list member cards (no role or test id in the DOM). */
export function adminMemberCards(page: Page) {
  return page.locator('.members-item');
}

/**
 * The admin list loads members 5 at a time (infinite scroll), so a category with more members
 * shows only part of them until the user scrolls. Scroll to the last card until all are loaded.
 */
export async function scrollUntilCardCount(cards: Locator, expected: number) {
  await expect(async () => {
    await cards.last().scrollIntoViewIfNeeded();
    await expect(cards).toHaveCount(expected, { timeout: 1_000 });
  }).toPass({ timeout: 15_000 });
}

/** Public Team page: member cards of one category (each category has its own .members-grid with an h2). */
export function publicCategoryCards(page: Page, category: string) {
  return page
    .locator('.members-grid')
    .filter({ has: page.getByRole('heading', { level: 2, name: category, exact: true }) })
    .locator('.team-member');
}

/** Opens the public Team page and waits until its data has loaded. */
export async function openPublicTeamPage(page: Page) {
  const published = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/team/published');
  await page.goto('/team');
  expect((await published).ok(), 'public team data must load').toBe(true);
}
