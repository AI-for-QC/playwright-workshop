# TM-01: підтверджені локатори модалки «Додати в команду»

- **Сценарій:** [TM-01-create-team-member.md](TM-01-create-team-member.md)
- **Стек:** TypeScript + @playwright/test
- **Джерело DOM:** живий застосунок `http://localhost:3000/admin-panel/team`, Chromium, 1280×720, знято 2026-11-06. Збіги кожного локатора пораховано скриптом у цьому DOM.
- **Маршрути:** після входу застосунок перенаправляє на `/admin-panel`; сторінка «Команда» — `/admin-panel/team`.

## Контейнер модалки

```ts
const modal = page.getByTestId('modal-overlay'); // 1 збіг
```

- `getByRole('dialog')` дає 0 збігів: модалка зверстана як `div role="button"`, тому кращого варіанта немає.
- **Відкрите питання:** чи `modal-overlay` — погоджений test id.
- **Не перевірено:** діалоги підтвердження («Так» / «Ні», «Видалити фото?»). Якщо вони зроблені тим самим компонентом, `modal-overlay` дасть 2 збіги. Перевірити, наприклад, кнопкою X на заповненій формі (TC-21).

## Локатори

| Елемент | Локатор | Збігів | Примітки |
|---|---|---|---|
| Заголовок модалки | `modal.getByText('Додати в команду', { exact: true })` | 1 | Ролі heading немає. `exact: true` потрібен, щоб не зачепити батьківські контейнери, у яких цей текст лише частина. |
| Кнопка X | `modal.getByRole('button', { name: 'Close modal' })` | 1 | |
| Поле категорії, порожнє | `modal.getByRole('button', { name: 'Оберіть категорію' })` | 1 | Після вибору 0: ім'я кнопки стає назвою обраної категорії. |
| Поле категорії в будь-якому стані | `modal.locator('button[aria-haspopup="listbox"]')` | 1 | CSS, бо інших варіантів немає: `getByLabel('Категорія')` дає 0 (`label for="category"` вказує на неіснуючий id). |
| Варіант категорії | `modal.getByRole('option', { name: 'Команда', exact: true })` | 1 з 3 | `exact: true` обов'язковий. Категорії — це дані користувачів. Плюс на сторінці вже є посилання «Команда» і кнопка-вкладка «Команда». |
| Поле імені | `modal.getByLabel("Ім'я та Прізвище")` | 1 | Без `modal` пошук `getByRole('textbox', { name: "Ім'я та Прізвище" })` дає **2 збіги**: за підрядком без урахування регістру він знаходить і поле пошуку «Введіть ім'я та прізвище». `exact: true` не допоможе, бо точне ім'я — `*Ім'я та Прізвище`. |
| Лічильник імені | `modal.locator('#fullName-character-count')` | 1 | Роль `status` дає 2 збіги без імені. Для перевірки краще `expect(nameField).toHaveAccessibleDescription('0/50')`, бо поле прив'язане до лічильника через `aria-describedby`. |
| Поле опису | `modal.getByLabel('Опис')` | 1 | |
| Лічильник опису | `modal.locator('#description-character-count')` | 1 | Лишається тільки id: поле не прив'язане до лічильника через `aria-describedby`. |
| Кнопка Чернетки | `modal.getByRole('button', { name: 'Зберегти як чернетку' })` | 1 | При відкритті вимкнена. |
| Кнопка Публікації | `modal.getByRole('button', { name: 'Опублікувати' })` | 1 | При відкритті вимкнена. Без `modal` ризик збігу з будь-яким «Опублікувати …» на сторінці. |
| Зона фото (клік, drag-and-drop) | `modal.getByRole('button', { name: 'Перетягніть файл сюди або натисніть для завантаження' })` | 1 | Для TC-25. |
| Прихований file input | `modal.getByTestId('image-input-hidden')` | 1 | Для `setInputFiles`, `display: none` цьому не заважає. `getByLabel('Image input')` теж дає 1. `getByLabel('Фото')` дає 0: `aria-label` перекриває `<label>`. |
| Кнопка «Додати в команду» на сторінці | `page.getByRole('button', { name: 'Додати в команду', exact: true })` | 1 до відкриття, **3 після** | `exact: true` не допомагає, бо всі три мають саме це ім'я. Використовувати лише поки модалка закрита. Після закриття (TC-22, крок 4) спершу дочекатися, що `modal` зник. |

## Що з'ясувалося про рядок 24 запису pc-1.spec.ts

`getByTestId('modal-overlay').getByRole('button', { name: 'Додати в команду' })` клікає не кнопку збереження, а сам `div.modal-container`. У нього `role="button"` та ім'я із заголовка модалки. Тому на порожній формі клік «спрацював», хоча нічого не робить. Рядок можна видалити. Див. також [pc-1-recording-analysis.md](pc-1-recording-analysis.md).

## Нотатки щодо доступності для розробників

Це не зміни в тестах, а питання до розробників.

1. **Немає ролі діалогу.** Модалка не має `role="dialog"` і `aria-modal="true"`. Overlay і контейнер мають `role="button"`, overlay ще й `tabindex="0"`.
2. **Заголовок модалки** — звичайний `<span>`, а не heading.
3. **Назви англійською в українському інтерфейсі:** «Close modal», «Clear input», «Image input».
4. **`label for="category"`** вказує на неіснуючий id. Ім'я поля категорії береться з плейсхолдера або з обраного значення.
5. **Зірочка в назвах полів.** Вона всередині `<label>`, тому імена виглядають як «\*Ім'я та Прізвище», «\*Опис». Обов'язковість не передана через `required` / `aria-required`.
6. **Лічильник опису не прив'язаний до поля** через `aria-describedby`, а лічильник імені прив'язаний. Поведінка непослідовна.
7. **Лічильники мають роль `status`** (live region). Скрінрідер озвучуватиме кожне натискання. Варто перевірити, чи так задумано.
8. **Прихований file input** має `aria-label`, який перекриває видимий `<label>` «Фото».
9. **Картинки без alt.** На сторінці за модалкою є кілька `img` без імені і `menu`, у якому лише картинка.

## Додаток: ARIA-знімки

### Модалка відразу після відкриття

```yaml
- button "Додати в команду":            # div.modal-overlay (data-testid="modal-overlay")
  - button "Додати в команду":          # div.modal-container
    - button "Close modal"
    - text: Додати в команду *Категорія
    - button "Оберіть категорію":
      - text: Оберіть категорію
      - img
    - text: "*Ім'я та Прізвище"
    - textbox "*Ім'я та Прізвище"
    - button "Clear input" [disabled]:
      - img
    - status: 0/50
    - text: "*Опис"
    - textbox "*Опис"
    - status: 0/200
    - text: Фото
    - button "Перетягніть файл сюди або натисніть для завантаження":
      - img
      - text: "Додайте файл сюди Розмір: 320x400"
    - button "Зберегти як чернетку" [disabled]
    - button "Опублікувати" [disabled]
```

### Відкритий список категорій

```yaml
    - button "Оберіть категорію" [expanded]:
      - text: Оберіть категорію
      - img
    - listbox:
      - option "Команда"
      - option "Волонтери"
      - option "Експерти"
```

### Після вибору категорії «Команда»

```yaml
    - button "Команда":
      - text: Команда
      - img
```

### Ключові атрибути з outerHTML

```html
<div data-testid="modal-overlay" class="modal-overlay" tabindex="0" role="button">
  <div role="button" aria-labelledby="«r1»" class="modal-container" tabindex="-1">
    <button aria-label="Close modal" type="button"></button>
    <span id="«r1»" class="modal-header-text">Додати в команду</span>
    <form data-testid="test-form" novalidate>
      <label for="category">*Категорія</label>
      <button type="button" class="select-input" aria-haspopup="listbox" aria-expanded="false">…Оберіть категорію…</button>
      <label for="fullName">*Ім'я та Прізвище</label>
      <input id="fullName" maxlength="50" aria-describedby="fullName-character-count" name="fullName">
      <button aria-label="Clear input" tabindex="-1" disabled></button>
      <output id="fullName-character-count">0/50</output>
      <label for="description">*Опис</label>
      <textarea id="description" maxlength="200" name="description"></textarea>
      <output id="description-character-count" for="description">0/200</output>
      <label for="image">Фото</label>
      <div aria-label="Перетягніть файл сюди або натисніть для завантаження" tabindex="0" role="button">
        <input aria-label="Image input" accept="image/*" data-testid="image-input-hidden" id="image" type="file" style="display: none;">
      </div>
    </form>
    <div class="modal-footer">
      <button class="btn-secondary" disabled>Зберегти як чернетку</button>
      <button class="btn-primary" disabled>Опублікувати</button>
    </div>
  </div>
</div>
```

Примітки до знімків:
- `accept="image/*"`: обмеження форматів jpeg/jpg/png/webp (TC-27) на рівні input не задане, тож перевіряється застосунком.
- `maxlength="50"` / `maxlength="200"`: ліміти символів із TC-13 / TC-16 задані атрибутами input.
