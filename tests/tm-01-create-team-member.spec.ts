import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
import { loginAsAdmin, type AdminSession } from './helpers/auth';
import {
  CATEGORY_A,
  VALID_DESCRIPTION,
  VALID_PHOTO,
  addMemberModal,
  adminMemberCards,
  authHeaders,
  confirmDialog,
  deleteMember,
  getCategory,
  openAdminTeamPage,
  openPublicTeamPage,
  publicCategoryCards,
  scrollUntilCardCount,
  uniqueValidName,
  waitForCreatedMember,
} from './helpers/team';

// Scenario: docs/TM-01-create-team-member.md

let session: AdminSession | undefined;
const createdMemberIds: number[] = [];

test.afterEach(async ({ request }) => {
  for (const id of createdMemberIds.splice(0)) await deleteMember(request, session!, id);
  session = undefined;
});

/**
 * PC-1 + PC-2: admin is on the Team page and Category A has at least one member
 * (needed where a case checks the order). Returns the number of members in Category A.
 */
async function preconditions(page: Page, request: APIRequestContext): Promise<number> {
  session = await loginAsAdmin(page);
  let category = await getCategory(request, session, CATEGORY_A);
  if (category.teamMembersCount === 0) {
    const seed = await request.post(`${session.apiOrigin}/api/TeamMembers`, {
      headers: authHeaders(session),
      data: { fullName: uniqueValidName(), categoryId: category.id, status: 0, description: VALID_DESCRIPTION, email: '', imageId: null },
    });
    expect(seed.ok(), 'seed member for PC-2').toBe(true);
    createdMemberIds.push(((await seed.json()) as { id: number }).id);
    category = await getCategory(request, session, CATEGORY_A);
  }
  await openAdminTeamPage(page);
  return category.teamMembersCount;
}

async function openAddMemberModal(page: Page) {
  await page.getByRole('button', { name: 'Додати в команду', exact: true }).click();
  const modal = addMemberModal(page);
  await expect(modal.root).toBeVisible();
  return modal;
}

test.describe('TC-01: The modal opens empty, with save buttons disabled', () => {
  test('clicking «Додати в команду» opens an empty modal with disabled save buttons and zero counters', async ({
    page,
    request,
  }) => {
    await test.step('Preconditions PC-1, PC-2', async () => {
      await preconditions(page, request);
    });

    const modal = await test.step('Step 1: click «Додати в команду»', async () => openAddMemberModal(page));

    await test.step('Modal title', async () => {
      await expect(modal.title).toBeVisible();
    });

    await test.step('Category, name, description and photo are empty and editable', async () => {
      // An empty category select shows its placeholder as the button name.
      await expect(modal.categoryEmpty).toBeEnabled();
      await expect(modal.nameField).toHaveValue('');
      await expect(modal.nameField).toBeEditable();
      await expect(modal.descriptionField).toHaveValue('');
      await expect(modal.descriptionField).toBeEditable();
      // Empty photo field: drop zone shows the upload placeholder, no preview, file input is enabled.
      await expect(modal.photoDropZone.getByText('Додайте файл сюди', { exact: true })).toBeVisible();
      await expect(modal.photoPreview).toHaveCount(0);
      await expect(modal.photoInput).toBeEnabled();
    });

    await test.step('Draft and Publish are disabled, X is enabled', async () => {
      await expect(modal.draftButton).toBeDisabled();
      await expect(modal.publishButton).toBeDisabled();
      await expect(modal.closeButton).toBeEnabled();
    });

    await test.step('Counters show 0/50 and 0/200', async () => {
      await expect(modal.nameCounter).toHaveText('0/50');
      await expect(modal.descriptionCounter).toHaveText('0/200');
    });
  });
});

test.describe('TC-02: The name and description counters update as you type', () => {
  test('counters follow every keystroke and deletion without leaving the field', async ({ page, request }) => {
    await preconditions(page, request);
    const modal = await openAddMemberModal(page);

    await test.step('Step 1: type «Олена» in the name field -> 5/50', async () => {
      const name = 'Олена';
      for (let i = 0; i < name.length; i++) {
        await modal.nameField.pressSequentially(name[i]);
        // "Updates with every keystroke, without a blur": checked while the field keeps focus.
        await expect(modal.nameField).toBeFocused();
        await expect(modal.nameCounter).toHaveText(`${i + 1}/50`);
      }
      await expect(modal.nameCounter).toHaveText('5/50');
    });

    await test.step('Step 2: type «Тренер» in the description field -> 6/200', async () => {
      const description = 'Тренер';
      for (let i = 0; i < description.length; i++) {
        await modal.descriptionField.pressSequentially(description[i]);
        await expect(modal.descriptionField).toBeFocused();
        await expect(modal.descriptionCounter).toHaveText(`${i + 1}/200`);
      }
      await expect(modal.descriptionCounter).toHaveText('6/200');
    });

    await test.step('Step 3: delete one character from each field -> 4/50 and 5/200', async () => {
      // Re-focusing a field puts the caret at the start, so move it to the end before deleting.
      await modal.nameField.press('End');
      await modal.nameField.press('Backspace');
      await expect(modal.nameField).toBeFocused();
      await expect(modal.nameCounter).toHaveText('4/50');

      await modal.descriptionField.press('End');
      await modal.descriptionField.press('Backspace');
      await expect(modal.descriptionField).toBeFocused();
      await expect(modal.descriptionCounter).toHaveText('5/200');
    });
  });
});

test.describe('TC-03: Save a member as a draft without a photo', () => {
  test('saves the member as a draft: last in Category A in the admin list and hidden on the public Team page', async ({
    page,
    request,
  }) => {
    const name = uniqueValidName();
    const draftConfirm = confirmDialog(page, 'Зберегти нового члена команди?');
    const cards = adminMemberCards(page);

    const membersBefore = await test.step('Preconditions PC-1, PC-2', async () => preconditions(page, request));
    const modal = await openAddMemberModal(page);

    await test.step('Steps 1-4: select Category A, enter valid name and description, leave the photo empty', async () => {
      await modal.categoryEmpty.click();
      await modal.categoryOption(CATEGORY_A).click();
      await modal.nameField.fill(name);
      await modal.descriptionField.fill(VALID_DESCRIPTION);
    });

    await test.step('Step 5: click the Draft button -> draft confirmation appears', async () => {
      await modal.draftButton.click();
      await expect(draftConfirm).toBeVisible();
    });

    await test.step('Step 6: «Так» -> the modal closes', async () => {
      const createdId = waitForCreatedMember(page);
      await draftConfirm.getByRole('button', { name: 'Так', exact: true }).click();
      createdMemberIds.push(await createdId);
      await expect(page.getByTestId('modal-overlay')).toHaveCount(0);
    });

    await test.step('Step 7: the member is last in Category A, as a draft, with the entered data', async () => {
      await scrollUntilCardCount(cards, membersBefore + 1);
      const lastCard = cards.last(); // "last in Category A"
      await expect(lastCard.getByText(name, { exact: true })).toBeVisible();
      await expect(lastCard.getByText(VALID_DESCRIPTION, { exact: true })).toBeVisible();
      await expect(lastCard.getByText('Чернетка', { exact: true })).toBeVisible();
    });

    await test.step('Step 8: the member is not on the public Team page', async () => {
      await openPublicTeamPage(page);
      await expect(page.getByText(name, { exact: true })).toHaveCount(0);
    });
  });
});

test.describe('TC-05: Publish a member immediately', () => {
  test('publishes the member: reminder shown, last in Category A in the admin list and on the public Team page', async ({
    page,
    request,
  }) => {
    const name = uniqueValidName();
    const publishConfirm = confirmDialog(page, 'Опублікувати нового члена команди?');
    const cropper = confirmDialog(page, 'Редагувати фото');
    const cards = adminMemberCards(page);

    const membersBefore = await test.step('Preconditions PC-1, PC-2', async () => preconditions(page, request));
    const modal = await openAddMemberModal(page);

    await test.step('Steps 1-2: select Category A, enter valid name and description', async () => {
      await modal.categoryEmpty.click();
      await modal.categoryOption(CATEGORY_A).click();
      await modal.nameField.fill(name);
      await modal.descriptionField.fill(VALID_DESCRIPTION);
    });

    await test.step('Step 3: upload the valid photo', async () => {
      await modal.photoInput.setInputFiles(VALID_PHOTO);
      await expect(modal.photoPreview).toBeVisible();
      // Scenario terms: a 320x400 photo does not open the cropper.
      await expect(cropper).toHaveCount(0);
    });

    await test.step('Step 4: click the Publish button', async () => {
      await modal.publishButton.click();
      await expect(publishConfirm).toBeVisible();
    });

    await test.step('Step 5: «Так» -> the modal closes and the order reminder appears', async () => {
      const createdId = waitForCreatedMember(page);
      await publishConfirm.getByRole('button', { name: 'Так', exact: true }).click();
      createdMemberIds.push(await createdId);
      await expect(page.getByTestId('modal-overlay')).toHaveCount(0);
      // The reminder is a toast that disappears after a few seconds.
      await expect(
        page.getByText('Не забудьте налаштувати порядок відображення члена команди на сайті', { exact: true }),
      ).toBeVisible();
    });

    await test.step('Step 6: the member is published and last in Category A in the admin list', async () => {
      await scrollUntilCardCount(cards, membersBefore + 1);
      const lastCard = cards.last(); // "last in Category A"
      await expect(lastCard.getByText(name, { exact: true })).toBeVisible();
      await expect(lastCard.getByText('Опубліковано', { exact: true })).toBeVisible();
    });

    await test.step('Step 7: on the public Team page the member is last in Category A with name, description and photo', async () => {
      await openPublicTeamPage(page);
      const lastPublicCard = publicCategoryCards(page, CATEGORY_A).last(); // "last in Category A"
      await expect(lastPublicCard.getByText(name, { exact: true })).toBeVisible();
      await expect(lastPublicCard.getByText(VALID_DESCRIPTION, { exact: true })).toBeVisible();

      const photo = lastPublicCard.getByRole('img', { name, exact: true });
      await expect(photo).toBeVisible();
      // "Shown" means the image actually loaded, not just that the <img> exists.
      await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    });
  });
});
