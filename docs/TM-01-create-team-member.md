TM01 — Create a team member as a draft or publish immediately

Source: AI-for-QC/Issues #1

Scope

In scope: the «Додати в команду» modal. This covers its initial state, field validation, the draft and publish flows, the close flows, and the photo checks that are already implemented.

Out of scope: localization, editing an existing member, category management, reorder drag-and-drop, search, status filters, API error toasts, accessibility.

Common preconditions

These apply to every case:





PC-1: An admin is logged in and is on the admin Team page.



PC-2: At least one team category exists. The cases call it Category A. Where a case checks the order of members, Category A already has at least one member.

Terms used in these cases





Draft button: the button that saves the member as a draft.



Publish button: the button that saves and publishes the member.



The draft and publish actions each open a confirmation dialog with «Так» / «Ні».



Valid name: Олена Петренко



Valid description: Досвідчений тренер з тестування (31 characters)



Valid photo: photo_320x400.jpg, 320×400 px, smaller than 3 MB. A photo of exactly this size does not open the cropper.



1. Opening the modal

TC-01 The modal opens empty, with save buttons disabled

Preconditions: PC-1, PC-2.

Steps:





Click «Додати в команду».

Expected result:





A modal opens with the title «Додати в команду».



The category, name, description, and photo fields are empty and editable.



The Draft button and the Publish button are disabled.



The X (close) button is enabled.



The name field shows a counter of 0/50.



The description field shows a counter of 0/200.

TC-02 The name and description counters update as you type

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Type Олена in the name field.



Type Тренер in the description field.



Delete one character from each field.

Expected result:





After step 1 the name counter shows 5/50.



After step 2 the description counter shows 6/200.



After step 3 the counters show 4/50 and 5/200.



Each counter updates with every keystroke, without needing a blur.



2. Successful save

TC-03 Save a member as a draft without a photo

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Select Category A.



Enter the valid name.



Enter the valid description.



Leave the photo field empty.



Click the Draft button.



In the confirmation dialog, click «Так».



Find the new member in the admin list.



Open the public Team page.

Expected result:





After step 5 a draft confirmation dialog appears.



After step 6 the modal closes.



The member is saved with draft status.



In the admin list, the member is last in Category A, with the name and description that were entered.



The member does not appear on the public Team page.

TC-04 «Ні» in the publish confirmation leaves the form open

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Select Category A.



Enter the valid name and the valid description.



Upload the valid photo.



Click the Publish button.



In the confirmation dialog, click «Ні».

Expected result:





The confirmation dialog closes.



The modal stays open, and every entered value and the photo are unchanged.



No member is created. The admin list does not change.

TC-05 Publish a member immediately

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Select Category A.



Enter the valid name and the valid description.



Upload the valid photo.



Click the Publish button.



In the confirmation dialog, click «Так».



Find the new member in the admin list.



Open the public Team page.

Expected result:





After step 5 the modal closes and the existing order reminder appears.



The member is saved with published status.



In the admin list, the member is last in Category A.



On the public Team page, the member appears last in Category A, with the entered name, description, and photo.



3. Button enablement

TC-06 The Draft button is enabled only when name, category, and description are all valid

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Enter the valid name. Check the Draft button.



Select Category A. Check the Draft button.



Enter a 9-character description, 123456789. Check the Draft button.



Add one character, so the description has 10 characters. Check the Draft button.



Clear the name field. Check the Draft button.

Expected result:





Steps 1–3: the Draft button is disabled.



Step 4: the Draft button is enabled.



Step 5: the Draft button is disabled again.

TC-07 The Publish button is enabled only when all fields and the photo are valid

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Select Category A. Enter the valid name and the valid description. Check both buttons.



Upload the valid photo. Check the Publish button.



Change the name to Олена1. Check both buttons.

Expected result:





Step 1: the Draft button is enabled. The Publish button is disabled.



Step 2: the Publish button is enabled.



Step 3: both buttons are disabled.



4. Name validation

TC-08 The name accepts letters, spaces, apostrophes, and hyphens

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Enter Ґанна-Їжа О’Єльченко in the name field and move focus away from it.



Clear the field. Enter Anna-Mae O’Neil and move focus away.

Expected result:





Both values are accepted as typed.



No validation error is shown.



The counter shows the matching length.

TC-09 A digit in the name is rejected

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Enter Олена2 in the name field.

Expected result:





The error «Поле не може містити цифри» is shown.



The Draft and Publish buttons stay disabled.

TC-10 Another forbidden character in the name is rejected

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Enter Олена@ in the name field.

Expected result:





The error «Поле може містити лише літери, пробіли, ’ -» is shown.



The Draft and Publish buttons stay disabled.

TC-11 A one-character name fails on blur

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Enter О in the name field.



Move focus away from the field.

Expected result:





The error «Не менше 2 символів» is shown.

TC-12 An empty name fails on blur

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Click into the name field without typing.



Move focus away from the field.

Expected result:





The error «Поле обов’язкове» is shown.

TC-13 The name is limited to 50 characters

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Type 50 valid letters in the name field.



Type one more letter.

Expected result:





After step 1 the counter shows 50/50 and no error is shown.



After step 2 the 51st character is not entered. The value still has 50 characters and the counter still shows 50/50.



5. Description validation

TC-14 An empty description fails on blur

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Click into the description field without typing.



Move focus away from the field.

Expected result:





A validation error is shown for the description field.



The Draft button stays disabled.

TC-15 Description length boundary: 9 characters fails, 10 passes

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open. Category A is selected and the valid name is entered.

Steps:





Enter 123456789 (9 characters) in the description field and move focus away.



Add one character so the value is 1234567890 (10 characters), and move focus away.

Expected result:





Step 1: a validation error is shown for the description field and the Draft button is disabled.



Step 2: the error disappears and the Draft button is enabled.

TC-16 The description is limited to 200 characters

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Enter 200 characters in the description field.



Type one more character.

Expected result:





After step 1 the counter shows 200/200.



After step 2 the 201st character is not entered and the counter stays at 200/200.



6. Whitespace handling

TC-17 Leading and trailing spaces are removed on blur and do not count toward the minimum

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Enter   Олена   in the name field and move focus away.



Clear the name field. Enter О and move focus away.



Enter   123456789   in the description field and move focus away.

Expected result:





Step 1: the value becomes Олена and the counter shows 5/50.



Step 2: the value becomes О and the error «Не менше 2 символів» is shown.



Step 3: the value becomes 123456789, the counter shows 9/200, and a description validation error is shown.

TC-18 Internal double spaces are saved as one space

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Select Category A.



Enter Олена  Петренко in the name field (two spaces between the words).



Enter Досвідчений  тренер  з тестування in the description field (with double spaces).



Click the Draft button, then «Так».



Check the saved member in the admin list.

Expected result:





The member is saved with the name Олена Петренко.



The description is saved as Досвідчений тренер з тестування.



Each double space is saved as a single space.



7. Category validation

TC-19 Leaving the category empty fails on blur, and choosing a category clears the error

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Open the category field and close it without choosing anything, so the field loses focus.



Choose Category A.

Expected result:





Step 1: the error «Поле обов’язкове» is shown for the category field.



Step 2: the error disappears and Category A is shown as the selected value.



8. Close flows

TC-20 X on an empty form closes it without asking

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open and nothing has been entered.

Steps:





Click X.

Expected result:





The modal closes immediately.



No discard confirmation is shown.

TC-21 X on a filled form asks before discarding, and «Ні» keeps the data

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Select Category A and enter the valid name.



Click X.



In the confirmation dialog, click «Ні».

Expected result:





After step 2 a discard confirmation dialog appears.



After step 3 the dialog closes and the modal stays open with Category A and the name unchanged.

TC-22 X on a filled form, «Так» discards the data

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Select Category A and enter the valid name and the valid description.



Click X.



In the confirmation dialog, click «Так».



Click «Додати в команду» again.

Expected result:





After step 3 the modal closes and no member is created.



After step 4 the modal opens empty, as described in TC-01.

TC-23 «Ні» in the draft confirmation keeps the form

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Select Category A and enter the valid name and the valid description.



Click the Draft button.



In the confirmation dialog, click «Ні».

Expected result:





The dialog closes.



The modal stays open with all entered values unchanged.



No member is created.



9. Photo

TC-24 Supported formats up to 3 MB can be selected

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Test data: run this case once for each file. Each image is 320×400 px and smaller than 3 MB.





photo.jpeg



photo.jpg



photo.png



photo.webp

Steps:





Click the photo field and choose the file in the file dialog.

Expected result:





The image is shown in the photo field.



No error is shown.

TC-25 A supported photo can be added by drag-and-drop

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Drag photo.png (320×400 px, smaller than 3 MB) onto the photo field and drop it.

Expected result:





The image is shown in the photo field.



No error is shown.

TC-26 A file larger than 3 MB is rejected

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Choose big.jpg, a valid JPG of about 3.5 MB.

Expected result:





The error «Фото не більше 3 MB» is shown.



The file is not kept, and the photo field stays empty.

TC-27 An unsupported format is rejected

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Choose photo.gif, smaller than 3 MB.

Expected result:





The error «Невірний формат фото, дозволено jpeg, jpg, png, webp» is shown.



The photo field stays empty.

TC-28 An image smaller than 320×400 shows a warning

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Test data: run this case once for each file.





small_319x400.png



small_320x399.png

Steps:





Choose the file.

Expected result:





The message «Розмір зображення менший за рекомендований» is shown.

TC-29 A larger image opens the cropper, and the confirmed crop is shown

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Choose large_1200x1600.jpg, smaller than 3 MB.



In the cropper, change the crop area.



Confirm the crop.

Expected result:





After step 1 the cropper opens with the chosen image.



After step 3 the cropper closes and the photo field shows the cropped area.

TC-30 Deleting a photo, «Ні» keeps the image

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open and the valid photo is uploaded.

Steps:





Hover over the photo and click Delete.



In the dialog «Видалити фото?», click «Ні».

Expected result:





After step 1 the dialog «Видалити фото?» appears.



After step 2 the dialog closes and the image is still shown in the photo field.

TC-31 Deleting a photo, «Так» empties the photo field

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open and the valid photo is uploaded.

Steps:





Hover over the photo and click Delete.



In the dialog «Видалити фото?», click «Так».

Expected result:





The photo is removed and the photo field returns to its empty state.



If the other fields are valid, the Publish button becomes disabled.

TC-32 Publishing without a photo shows an error

Preconditions: PC-1, PC-2. The «Додати в команду» modal is open.

Steps:





Select Category A and enter the valid name and the valid description.



Leave the photo field empty.



Try to publish by clicking the Publish button.

Expected result:





The message «Фото обов’язкове при публікації» is shown.



The member is not published and the modal stays open.



Open questions





Description error text: the issue does not give the error text for an empty or too-short description. TC-14, TC-15, and TC-17 check only that an error is shown.



Photo-required trigger: the Publish button is disabled while there is no photo (TC-07), but the issue also requires the message «Фото обов’язкове при публікації». It is unclear what shows this message: clicking the disabled button, hovering over it, or something else. TC-32 needs to be clarified.



Small images: the issue does not say whether an image smaller than 320×400 is kept after the warning in TC-28.



Apostrophe characters: the cases use the typographic apostrophe ’, which is the one shown in the error text. The issue does not say whether the ASCII apostrophe ' is also accepted.

