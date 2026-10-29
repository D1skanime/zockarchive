# V2 lib native-control exceptions

`npm run v2:maintainability` rejects native `button`, `input`, `select`, and
`textarea` elements in production templates below `src/v2/lib`. The matching
base controls are exempt in their own implementation. Every other entry below
is exact to one source location and must retain a native accessibility contract
that an existing primitive cannot preserve.

| Path                                           | Tag        | Line | Required semantics and reason                                                                                                |
| ---------------------------------------------- | ---------- | ---: | ---------------------------------------------------------------------------------------------------------------------------- |
| `lib/forms/RCheckbox/RCheckbox.vue`            | `input`    |  210 | The primitive owns a native checkbox so browsers expose checked, indeterminate, label, and form-submission semantics.        |
| `lib/forms/RComboboxField/RComboboxField.vue`  | `input`    |  372 | The editable combobox requires a real text input to maintain the input-to-listbox keyboard and IME contract.                 |
| `lib/forms/RDateField/RDateField.vue`          | `button`   |  510 | Calendar cells require roving tabindex, `aria-selected`, and disabled-day semantics in a grid.                               |
| `lib/forms/RDropzone/RDropzone.vue`            | `input`    |  100 | A visually hidden file input is required to open the browser file chooser and transfer selected files.                       |
| `lib/forms/RRating/RRating.vue`                | `button`   |  187 | Radio-style star controls use native buttons for the required roving keyboard and disabled semantics.                        |
| `lib/forms/RSlider/RSlider.vue`                | `input`    |  159 | The range primitive owns a native range input so assistive technology receives its value and step semantics.                 |
| `lib/forms/RTextField/RTextField.vue`          | `textarea` |  461 | The base text field owns its multiline editing control.                                                                      |
| `lib/forms/RTextField/RTextField.vue`          | `input`    |  480 | The base text field owns its single-line editing control.                                                                    |
| `lib/overlays/RCarousel/RCarousel.vue`         | `button`   |  255 | Media thumbnails carry `aria-current` and preserve the thumbnail slot's native media-preview semantics.                      |
| `lib/overlays/RCarousel/RCarousel.vue`         | `button`   |  339 | Inline media thumbnails carry `aria-current` and preserve the thumbnail slot's native media-preview semantics.               |
| `lib/primitives/RChip/RChip.vue`               | `button`   |  140 | The close control is nested in the chip root and preserves its compact tag layout without introducing a nested RBtn surface. |
| `lib/primitives/RTabNav/RTabNav.vue`           | `button`   |  150 | Tabs require native `role=tab` keyboard and selected-state semantics.                                                        |
| `lib/structural/RCollapsible/RCollapsible.vue` | `button`   |  109 | The disclosure header owns native expanded and disabled semantics while containing arbitrary header-slot content.            |
