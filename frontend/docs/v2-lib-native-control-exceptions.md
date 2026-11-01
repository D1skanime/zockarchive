# V2 lib native-control exceptions

`npm run v2:maintainability` rejects native `button`, `input`, `select`, and
`textarea` elements in production templates below `src/v2/lib`. The matching
base controls are exempt in their own implementation. Every other entry below
is exact to one source location and must retain a native accessibility contract
that an existing primitive cannot preserve.

| Path                                             | Tag        | Line | Required semantics and reason                                                                                                 |
| ------------------------------------------------ | ---------- | ---: | ----------------------------------------------------------------------------------------------------------------------------- |
| `lib/forms/ZACheckbox/ZACheckbox.vue`            | `input`    |  210 | The primitive owns a native checkbox so browsers expose checked, indeterminate, label, and form-submission semantics.         |
| `lib/forms/ZAComboboxField/ZAComboboxField.vue`  | `input`    |  368 | The editable combobox requires a real text input to maintain the input-to-listbox keyboard and IME contract.                  |
| `lib/forms/ZADateField/ZADateField.vue`          | `button`   |  510 | Calendar cells require roving tabindex, `aria-selected`, and disabled-day semantics in a grid.                                |
| `lib/forms/ZADropzone/ZADropzone.vue`            | `input`    |  100 | A visually hidden file input is required to open the browser file chooser and transfer selected files.                        |
| `lib/forms/ZARating/ZARating.vue`                | `button`   |  187 | Radio-style star controls use native buttons for the required roving keyboard and disabled semantics.                         |
| `lib/forms/ZASlider/ZASlider.vue`                | `input`    |  159 | The range primitive owns a native range input so assistive technology receives its value and step semantics.                  |
| `lib/forms/ZATextField/ZATextField.vue`          | `textarea` |  458 | The base text field owns its multiline editing control.                                                                       |
| `lib/forms/ZATextField/ZATextField.vue`          | `input`    |  477 | The base text field owns its single-line editing control.                                                                     |
| `lib/overlays/ZACarousel/ZACarousel.vue`         | `button`   |  255 | Media thumbnails carry `aria-current` and preserve the thumbnail slot's native media-preview semantics.                       |
| `lib/overlays/ZACarousel/ZACarousel.vue`         | `button`   |  339 | Inline media thumbnails carry `aria-current` and preserve the thumbnail slot's native media-preview semantics.                |
| `lib/primitives/ZAChip/ZAChip.vue`               | `button`   |  140 | The close control is nested in the chip root and preserves its compact tag layout without introducing a nested ZABtn surface. |
| `lib/primitives/ZATabNav/ZATabNav.vue`           | `button`   |  150 | Tabs require native `role=tab` keyboard and selected-state semantics.                                                         |
| `lib/structural/ZACollapsible/ZACollapsible.vue` | `button`   |  109 | The disclosure header owns native expanded and disabled semantics while containing arbitrary header-slot content.             |
